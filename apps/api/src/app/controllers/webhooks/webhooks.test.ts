import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '../../types/enums';
import { dashboardAccessToken, sub2, tokenName, tokenSymbol } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';

const user = request.agent(app);

describe('Referral Rewards', () => {
    let poolId: string, tokenAddress: string, referralRewardId: string, token: string;

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

    it('POST /referral-rewards', (done) => {
        const expiryDate = addMinutes(new Date(), 30);
        const successUrl = 'http://www.google.com';
        user.post('/v1/referral-rewards/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                platform: 0,
                expiryDate,
                rewardLimit: 0,
                claimAmount: 1,
                successUrl,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.token).toBeDefined();
                expect(res.body.successUrl).toBe(successUrl);
                expect(res.body.amount).toBe(100);
                expect(new Date(res.body.expiryDate).getTime()).toBe(expiryDate.getTime());
                referralRewardId = res.body._id;
                token = res.body.token;
            })
            .expect(201, done);
    });

    it('POST /referral/:token/qualify', (done) => {
        user.post(`/v1/webhook/referral/${token}/qualify`)
            .send({
                code: sub2,
            })
            .expect((res: request.Response) => {
                expect(res.body.referralRewardId).toBe(referralRewardId);
                expect(res.body.uuid).toBeDefined();
                expect(res.body.sub).toBe(sub2);
            })
            .expect(201, done);
    });
});
