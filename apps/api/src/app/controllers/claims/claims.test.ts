import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import { dashboardAccessToken, tokenName, tokenSymbol, walletAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { WithdrawalState } from '@thxnetwork/api/types/enums';
import { getRewardConfiguration } from '../rewards-utils';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { RewardDocument } from '@thxnetwork/api/models/Reward';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';

const user = request.agent(app);

describe('Claims', () => {
    let pool: AssetPoolDocument,
        poolId: string,
        poolAddress: string,
        reward: RewardDocument,
        claim: ClaimDocument,
        tokenAddress: string;

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    it('Create ERC20', (done) => {
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

    it('Create Asset Pool', (done) => {
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
                pool = res.body;
            })
            .expect(201, done);
    });

    it('Create reward', (done) => {
        user.post('/v1/rewards-token/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send(getRewardConfiguration('no-limit-and-claim-one-disabled'))
            .expect((res: request.Response) => {
                expect(res.body.id).toBeDefined();
                expect(res.body.claims).toBeDefined();
                expect(res.body.claims[0].id).toBeDefined();
                reward = res.body;
                claim = res.body.claims[0];
            })
            .expect(201, done);
    });

    describe('GET /claims/:id', () => {
        it('should return 200', (done) => {
            user.get(`/v1/claims/${claim.id}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.poolAddress).toEqual(poolAddress);
                    expect(res.body.tokenSymbol).toEqual(tokenSymbol);
                    expect(res.body.withdrawAmount).toEqual(reward.withdrawAmount);
                    expect(res.body.rewardId).toEqual(reward.id);
                    expect(res.body.chainId).toEqual(pool.chainId);
                })
                .expect(200, done);
        });
    });

    describe('GET /claims/hash/:hash', () => {
        it('should return ClaimURLData', (done) => {
            const hash = Buffer.from(JSON.stringify({ poolAddress: pool.address, rewardId: reward.id })).toString(
                'base64',
            );
            user.get(`/v1/claims/hash/${hash}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.rewardId).toEqual(reward.id);
                    expect(res.body.poolAddress).toEqual(poolAddress);
                    expect(res.body.tokenSymbol).toEqual(tokenSymbol);
                    expect(res.body.withdrawAmount).toEqual(reward.withdrawAmount);
                    expect(res.body.chainId).toEqual(pool.chainId);
                })
                .expect(200, done);
        });
    });

    describe('POST /claims/:id/collect', () => {
        it('should return a 200 and withdrawal id', (done) => {
            user.post(`/v1/claims/${claim.id}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.state).toEqual(WithdrawalState.Withdrawn);
                })
                .expect(200, done);
        });
    });
});
