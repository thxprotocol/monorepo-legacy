import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { ShopifyPerkDocument } from '@thxnetwork/api/models/ShopifyPerk';

const user = request.agent(app);

describe('Shopify Perks', () => {
    let poolId: string, perk: ShopifyPerkDocument;
    const config = {
        title: '',
        description: '',
        amount: 1,
        price: 0,
        priceCurrency: 'USD',
        pointPrice: 0,
        limit: 0,
        claimLimit: 0,
        claimAmount: 1,
        isPromoted: true,
    };

    beforeAll(beforeAllCallback);
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
        const expiryDate = addMinutes(new Date(), 30),
            priceRuleId = '1234',
            discountCode = 'BLACK FRIDAY';
        user.post('/v1/shopify-perks/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .attach('file', image, {
                filename: 'test.jpg',
                contentType: 'image/jpg',
            })
            .field({
                ...config,
                expiryDate: String(expiryDate),
                priceRuleId,
                discountCode,
            })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.title).toBe(config.title);
                expect(body.description).toBe(config.description);
                expect(body.image).toBeDefined();
                expect(body.amount).toBe(config.amount);
                expect(body.pointPrice).toBe(config.pointPrice);
                expect(new Date(body.expiryDate).getDate()).toBe(expiryDate.getDate());
                expect(body.limit).toBe(config.limit);
                expect(body.isPromoted).toBe(true);
                expect(body.priceRuleId).toBe(priceRuleId);
                expect(body.discountCode).toBe(discountCode);
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
