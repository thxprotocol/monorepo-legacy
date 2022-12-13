import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import { dashboardAccessToken, tokenName, tokenSymbol, walletAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { WithdrawalState } from '@thxnetwork/api/types/enums';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { addMinutes } from '@thxnetwork/api/util/rewards';

const user = request.agent(app);

describe('Claims', () => {
    let poolId: string, poolAddress: string, claim: ClaimDocument, tokenAddress: string;

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
                poolAddress = res.body.address;
            })
            .expect(201, done);
    });

    it('POST /erc20-perks', (done) => {
        const expiryDate = addMinutes(new Date(), 30);
        user.post('/v1/erc20-perks/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 1,
                platform: 0,
                expiryDate,
                rewardLimit: 0,
                claimAmount: 1,
            })
            .expect((res: request.Response) => {
                expect(res.body._id).toBeDefined();
                expect(res.body.claims).toBeDefined();
                expect(res.body.claims[0].id).toBeDefined();
                claim = res.body.claims[0];
            })
            .expect(201, done);
    });

    describe('GET /claims/:id', () => {
        it('should return 200', (done) => {
            user.get(`/v1/claims/${claim.id}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.claim.id).toBeDefined();
                    expect(res.body.pool.address).toEqual(poolAddress);
                    expect(res.body.erc20.symbol).toEqual(tokenSymbol);
                    expect(res.body.reward).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('POST /claims/:id/collect', () => {
        it('should return a 200 and withdrawal id', (done) => {
            user.post(`/v1/claims/${claim.id}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.claim.sub).toBeDefined();
                    expect(res.body.withdrawal.state).toEqual(WithdrawalState.Withdrawn);
                })
                .expect(200, done);
        });
    });
});
