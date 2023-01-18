import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import {
    dashboardAccessToken,
    tokenName,
    tokenSymbol,
    walletAccessToken,
    walletAccessToken2,
    account,
    account2,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { addMinutes, subMinutes } from '@thxnetwork/api/util/rewards';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';

const user = request.agent(app);

describe('Claims', () => {
    let poolId: string, erc20: ERC20Document;

    beforeAll(beforeAllCallback);
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
                erc20 = body;
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    describe('ExpiryDate = t-30min', () => {
        const expiryDate = subMinutes(new Date(), 30);
        let claim: ClaimDocument;

        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: '',
                    description: '',
                    erc20Id: erc20._id,
                    amount: 1,
                    expiryDate: String(expiryDate),
                    pointPrice: 0,
                    claimAmount: 1,
                    rewardLimit: 0,
                    platform: 0,
                })
                .expect((res: request.Response) => {
                    expect(res.body.claims).toHaveLength(1);
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });
        it('should return a 403 when expired', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk claim has expired.');
                })
                .expect(403, done);
        });
    });

    describe('PointPrice = 100', () => {
        let claim: ClaimDocument;

        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: '',
                    description: '',
                    erc20Id: erc20._id,
                    amount: 1,
                    pointPrice: 100,
                    claimAmount: 1,
                    rewardLimit: 0,
                    platform: 0,
                })
                .expect((res: request.Response) => {
                    expect(res.body.claims).toHaveLength(1);
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        it('should return a 403 for claim', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk should be redeemed with points.');
                })
                .expect(403, done);
        });
    });

    describe('RewardLimit = 0', () => {
        let claim: ClaimDocument;

        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: '',
                    description: '',
                    erc20Id: erc20._id,
                    amount: 1,
                    pointPrice: 0,
                    rewardLimit: 0,
                    claimAmount: 1,
                    platform: 0,
                })
                .expect((res: request.Response) => {
                    expect(res.body.claims).toHaveLength(1);
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });
        it('should return a 200 for first claim attempt by wallet 0', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(200, done);
        });
        it('should return a 403 for claimWithPointPrice', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect(200, done);
        });
    });

    describe('RewardLimit = 1', () => {
        let claim: ClaimDocument;

        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: '',
                    description: '',
                    erc20Id: erc20._id,
                    amount: 1,
                    pointPrice: 0,
                    rewardLimit: 1,
                    claimAmount: 1,
                    platform: 0,
                })
                .expect((res: request.Response) => {
                    expect(res.body.claims).toHaveLength(1);
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });
        it('should return a 200 for first claim attempt by wallet 0', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(200, done);
        });
        it('should return a 403 for claimWithPointPrice', (done) => {
            user.post(`/v1/claims/${claim.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe("This perk has reached it's limit.");
                })
                .expect(403, done);
        });
    });

    describe('ClaimAmount > 1', () => {
        let claim0: ClaimDocument, claim1: ClaimDocument;

        it('POST /erc20-perks', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    erc20Id: erc20._id,
                    amount: 1,
                    platform: 0,
                    expiryDate,
                    rewardLimit: 0,
                    claimAmount: 2,
                })
                .expect((res: request.Response) => {
                    expect(res.body.claims).toHaveLength(2);
                    claim0 = res.body.claims[0];
                    claim1 = res.body.claims[1];
                    expect(res.body.claims[2]).toBeUndefined();
                })
                .expect(201, done);
        });
        it('should return a 200 for claim 0', (done) => {
            user.post(`/v1/claims/${claim0.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.claim.sub).toBe(account2.sub);
                    expect(body.claim.claimedAt).toBeDefined();
                })
                .expect(200, done);
        });
        it('should return a 403 for second attempt on claim 0', (done) => {
            user.post(`/v1/claims/${claim0.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('You have already claimed this perk.');
                })
                .expect(403, done);
        });
        it('should return a 403 for claim 0', (done) => {
            user.post(`/v1/claims/${claim0.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('This perk has been claimed by someone else.');
                })
                .expect(403, done);
        });
        it('should return a 200 for claim 1', (done) => {
            user.post(`/v1/claims/${claim1.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect(({ body }: request.Response) => {
                    expect(body.claim.sub).toBe(account.sub);
                    expect(body.claim.claimedAt).toBeDefined();
                })
                .expect(200, done);
        });
        it('should return a 403 for second attempt on claim 1', (done) => {
            user.post(`/v1/claims/${claim1.uuid}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .expect((res: request.Response) => {
                    expect(res.body.error.message).toBe('You have already claimed this perk.');
                })
                .expect(403, done);
        });
    });
});
