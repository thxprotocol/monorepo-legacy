import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/api/types/enums';
import {
    dashboardAccessToken,
    sub,
    tokenName,
    tokenSymbol,
    widgetAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress, toWei } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';

const user = request.agent(app);

describe('Daily Rewards', () => {
    let erc20: ERC20Document, poolId: string, dailyReward: any, dailyRewardUuid: string;
    const totalSupply = toWei('100000');

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    it('POST /wallets', (done) => {
        user.post('/v1/wallets')
            .set({ Authorization: widgetAccessToken })
            .send({
                chainId: ChainId.Hardhat,
                sub,
                forceSync: true,
            })
            .expect((res: request.Response) => {
                expect(res.body.sub).toEqual(sub);
                expect(res.body.chainId).toEqual(ChainId.Hardhat);
                expect(res.body.address).toBeDefined();
            })
            .expect(201, done);
    });

    it('POST /erc20', (done) => {
        user.post('/v1/erc20')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                name: tokenName,
                symbol: tokenSymbol,
                type: ERC20Type.Limited,
                totalSupply,
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
                expect(res.body.archived).toBe(false);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /daily-rewards', (done) => {
        const title = 'First Daily Reward';
        const description = 'description';
        const amount = 1500;
        user.post(`/v1/daily-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title,
                description,
                amount,
            })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.title).toBe(title);
                expect(body.description).toBe(description);
                expect(body.amount).toBe(amount.toString());
                dailyRewardUuid = body.uuid;
                dailyReward = body;
            })
            .expect(201, done);
    });

    it('GET /daily-rewards/:id', (done) => {
        user.get(`/v1/daily-rewards/${dailyReward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.title).toBe(dailyReward.title);
                expect(body.description).toBe(dailyReward.description);
                expect(body.amount).toBe(dailyReward.amount.toString());
            })
            .expect(200, done);
    });

    it('GET /daily-rewards/', (done) => {
        user.get(`/v1/daily-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.results.length).toBe(1);
                expect(body.results[0].uuid).toBeDefined();
                expect(body.results[0].title).toBe(dailyReward.title);
                expect(body.results[0].description).toBe(dailyReward.description);
                expect(body.results[0].amount).toBe(dailyReward.amount.toString());
                expect(body.total).toBe(1);
            })
            .expect(200, done);
    });

    it('PATCH /daily-rewards/:id', (done) => {
        const amount = 2000;
        user.patch(`/v1/daily-rewards/${dailyReward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                amount,
            })
            .expect(({ body }: request.Response) => {
                console.log('BODY', body);
                expect(body.amount).toBe(amount.toString());
                dailyReward = body;
            })
            .expect(200, done);
    });

    it('POST /rewards/daily/:uuid/claim', (done) => {
        user.post(`/v1/rewards/daily/${dailyRewardUuid}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(({ body }: request.Response) => {
                console.log('BODY 1', body);
            })
            .expect(201, done);
    });

    it('POST /rewards/daily/:uuid/claim shoul throw an error', (done) => {
        user.post(`/v1/rewards/daily/${dailyRewardUuid}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(({ body }: request.Response) => {
                console.log('BODY 2', body);
                expect(body.error).toBe('This reward is not claimable yet');
            })
            .expect(200, done);
    });

    it('DELETE /daily-rewards/:id', (done) => {
        user.delete(`/v1/daily-rewards/${dailyReward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(204, done);
    });
});
