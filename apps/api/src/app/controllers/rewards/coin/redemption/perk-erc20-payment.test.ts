import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { dashboardAccessToken, tokenName, tokenSymbol, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { fromWei, isAddress, toWei } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes, subMinutes } from '@thxnetwork/api/util/rewards';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';

const user = request.agent(app);

describe('ERC20 Perk Payment', () => {
    let erc20: ERC20Document, poolId: string, rewardId: string, perkUuid: string, perk: any;
    const totalSupply = toWei('100000');

    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

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
                expect(res.body.settings.isArchived).toBe(false);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /pools/:id/topup', (done) => {
        const amount = fromWei(totalSupply, 'ether'); // 100 eth
        user.post(`/v1/pools/${poolId}/topup`)
            .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
            .send({ erc20Id: erc20._id, amount })
            .expect(200, done);
    });

    it('POST /point-rewards', (done) => {
        user.post(`/v1/point-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Earn points!',
                description: 'For your engagement',
                amount: 1500,
                platform: RewardConditionPlatform.Twitter,
                interaction: RewardConditionInteraction.TwitterFollow,
                content: '123123',
                index: 0,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                rewardId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /erc20-perks', (done) => {
        const expiryDate = subMinutes(new Date(), 30);
        const image = 'http://myimage.com/1';

        user.post('/v1/erc20-perks/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                erc20Id: erc20._id,
                title: 'Receive 500 TST tokens',
                description: 'Lorem ipsum dolor sit amet.',
                image,
                amount: 500,
                limit: 1,
                pointPrice: 1500,
                expiryDate,
                claimAmount: 0,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                perkUuid = res.body.uuid;
                perk = res.body;
            })
            .expect(201, done);
    });

    it('GET /rewards should return isDisabled = true, because the Perk is expired', (done) => {
        user.get(`/v1/rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.coin.length).toBe(1);
                expect(body.coin[0].isDisabled).toBe(true);
                expect(body.coin[0].expiry.now).toBeDefined();
                expect(body.coin[0].expiry.date).toBeDefined();
                expect(body.coin[0].progress.limit).toBe(1);
                expect(body.coin[0].progress.count).toBe(0);
            })
            .expect(200, done);
    });

    it('PATCH /erc20-perks/:id', (done) => {
        perk.expiryDate = addMinutes(new Date(), 30);
        user.patch(`/v1/erc20-perks/${perk._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                ...perk,
            })
            .expect(({ body }: request.Response) => {
                perk = body;
            })
            .expect(200, done);
    });

    it('POST /quests/social/:uuid/claim', (done) => {
        user.post(`/v1/quests/social/${rewardId}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(201, done);
    });

    it('POST /rewards/coin/:uuid/redemption', (done) => {
        user.post(`/v1/rewards/coin/${perkUuid}/redemption`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.withdrawal).toBeDefined();
                expect(res.body.erc20PerkPayment).toBeDefined();
                expect(res.body.erc20PerkPayment.poolId).toBe(poolId);
            })
            .expect(201, done);
    });

    it('GET /rewards should return isDisabled = true, because the supply is gone', (done) => {
        user.get(`/v1/rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.coin[0].isDisabled).toBe(true);
                expect(body.coin[0].progress.limit).toBe(1);
                expect(body.coin[0].progress.count).toBe(1);
            })
            .expect(200, done);
    });
});
