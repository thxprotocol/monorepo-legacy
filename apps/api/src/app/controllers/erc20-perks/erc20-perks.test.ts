import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import {
    dashboardAccessToken,
    tokenName,
    tokenSymbol,
    walletAccessToken,
    walletAccessToken2,
    walletAccessToken3,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { WithdrawalState } from '@thxnetwork/api/types/enums';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { addMinutes, subMinutes } from '@thxnetwork/api/util/rewards';

const user = request.agent(app);

describe('ERC20 Perks', () => {
    let poolId: string, tokenAddress: string;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    it('POST /erc20', (done) => {
        user.post('/v1/erc20')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                name: tokenName,
                symbol: tokenSymbol,
                type: ERC20Type.Unlimited,
                totalSupply: 0,
            })
            .expect(({ body }: request.Response) => {
                expect(isAddress(body.address)).toBe(true);
                tokenAddress = body.address;
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                erc20tokens: [tokenAddress],
            })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    describe('Reward Limit === 0', () => {
        let claim: ClaimDocument;
        it('POST /erc20-perks', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            const pointPrice = 200;
            const image = 'myImage';
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    amount: 1,
                    platform: 0,
                    expiryDate: expiryDate.toString(),
                    rewardLimit: 0,
                    claimAmount: 1,
                    pointPrice,
                    image,
                    isPromoted: true,
                })
                .expect((res: request.Response) => {
                    expect(res.body.uuid).toBeDefined();
                    expect(res.body.pointPrice).toBe(pointPrice);
                    expect(res.body.image).toBe(image);
                    expect(res.body.isPromoted).toBe(true);
                    expect(new Date(res.body.expiryDate).getDate()).toBe(expiryDate.getDate());
                    expect(res.body.claims.length).toBe(1);
                    expect(res.body.claims[0].uuid).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /erc20-perks/:id/claim', () => {
            it('should return a 200 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.claim._id).toBeDefined();
                        expect(res.body.withdrawal.state).toEqual(WithdrawalState.Withdrawn);
                    })
                    .expect(200, done);
            });

            it('should return a 403 for this second claim from the same account', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe('You can only claim this reward once.');
                    })
                    .expect(403, done);
            });

            it('should return a 200 for this second claim from another account', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect(200, done);
            });
        });
    });

    describe('Reward Limit === 1', () => {
        let claim: ClaimDocument;
        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .field({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    amount: 1,
                    platform: 0,
                    rewardLimit: 2,
                    expiryDate: addMinutes(new Date(), 30).toString(),
                    claimAmount: 1,
                })
                .expect((res: request.Response) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.claims.length).toBe(1);
                    expect(res.body.claims[0].uuid).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 200', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(200, done);
            });

            it('should return a 403 for the second claim on the same account', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe('You can only claim this reward once.');
                    })
                    .expect(403, done);
            });

            it('should return a 200 for the second claim on another account', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect(200, done);
            });

            it('should return a 403 for the second claim on the same account', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe("This reward has reached it's limit");
                    })
                    .expect(403, done);
            });

            it('should return a 403 for the third claim on another account', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken3 })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe("This reward has reached it's limit");
                    })
                    .expect(403, done);
            });
        });
    });

    describe('Expiration Date < Date.now', () => {
        let claim: ClaimDocument;
        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .field({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    amount: 1,
                    platform: 0,
                    rewardLimit: 0,
                    expiryDate: subMinutes(new Date(), 30).toString(),
                    claimAmount: 1,
                })
                .expect((res: request.Response) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].uuid).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 403', (done) => {
                user.post(`/v1/claims/${claim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe('This reward claim has expired.');
                    })
                    .expect(403, done);
            });
        });
    });

    describe('GET /erc721-perks', () => {
        it('Should return a list of rewards', (done) => {
            user.get('/v1/erc20-perks')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.results.length).toBe(3);
                    expect(res.body.results[0].claims).toBeDefined();
                    expect(res.body.limit).toBe(10);
                    expect(res.body.total).toBe(3);
                })
                .expect(200, done);
        });
    });
});
