import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '../../types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { createImage } from '@thxnetwork/api/util/jest/images';

import { ShopifyPerkDocument } from '@thxnetwork/api/models/ShopifyPerk';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/index';

const user = request.agent(app);

describe('Shopify Perks', () => {
    let poolId: string, perk: ShopifyPerkDocument;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

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

    it('POST /shopify-perks', (done) => {
        const image = createImage();
        const title = 'Lorem',
            description = 'Ipsum',
            expiryDate = addMinutes(new Date(), 30),
            pointPrice = 200,
            amount = '1',
            platform = RewardConditionPlatform.Shopify,
            interaction = RewardConditionInteraction.ShopifyTotalSpent,
            content = 'content',
            rewardLimit = 1,
            claimAmount = 0,
            isPromoted = true,
            priceRuleId = '1234';
        user.post('/v1/shopify-perks/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .attach('file', image, {
                filename: 'test.jpg',
                contentType: 'image/jpg',
            })
            .field({
                title,
                description,
                image,
                amount,
                pointPrice,
                platform,
                interaction,
                content,
                expiryDate: expiryDate.toString(),
                rewardLimit,
                claimAmount,
                isPromoted,
                priceRuleId,
            })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.title).toBe(title);
                expect(body.description).toBe(description);
                expect(body.image).toBeDefined();
                expect(body.amount).toBe(amount);
                expect(body.pointPrice).toBe(pointPrice);
                expect(body.platform).toBe(platform);
                expect(body.interaction).toBe(interaction);
                expect(body.content).toBe(content);
                expect(new Date(body.expiryDate).getDate()).toBe(expiryDate.getDate());
                expect(body.rewardLimit).toBe(rewardLimit);
                expect(body.claimAmount).toBe(claimAmount);
                expect(body.claims.length).toBe(0);
                expect(body.isPromoted).toBe(true);
                expect(body.priceRuleId).toBe(priceRuleId);
            })
            .expect(201, done);
    });

    it('GET /shopify-perks', (done) => {
        user.get('/v1/shopify-perks')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.results.length).toBe(1);
                expect(body.results[0].claims).toHaveLength(0);
                expect(body.limit).toBe(10);
                expect(body.total).toBe(1);
                perk = body.results[0];
            })
            .expect(200, done);
    });

    it('GET /shopify-perks/:uuid', (done) => {
        user.get('/v1/shopify-perks/' + perk._id)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.claims).toHaveLength(perk.claims.length);
                expect(body.payments).toHaveLength(0);
            })
            .expect(200, done);
    });

    it('DELETE /shopify-perks/:uuid', (done) => {
        user.delete('/v1/shopify-perks/' + perk._id)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(204, done);
    });
});
