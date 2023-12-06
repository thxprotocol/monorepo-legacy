import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import {
    dashboardAccessToken,
    dashboardAccessToken2,
    sub2,
    tokenName,
    tokenSymbol,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PoolTransfer, PoolTransferDocument } from '@thxnetwork/api/models/PoolTransfer';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';
import { createImage } from '@thxnetwork/api/util/jest/images';
import { addMinutes } from 'date-fns';
import { isAddress } from 'web3-utils';

const user = request.agent(app);

describe('Campaign Transfer', () => {
    let pool: AssetPoolDocument, poolTransfer: PoolTransferDocument, erc20: ERC20Document;

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
                erc20 = body;
                expect(isAddress(body.address)).toBe(true);
            })
            .expect(201, done);
    });

    describe('POST /pools', () => {
        it('HTTP 201 (success)', (done) => {
            const title = 'My Test Pool';
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    title,
                })
                .expect((res: request.Response) => {
                    pool = res.body;
                    expect(res.body.address).toBeDefined();
                    expect(res.body.settings.title).toBe(title);
                    expect(res.body.settings.isArchived).toBe(false);
                })
                .expect(201, done);
        });
    });

    describe('Coin Reward', () => {
        it('POST /erc20-perks', (done) => {
            const title = 'Lorem',
                description = 'Ipsum',
                expiryDate = addMinutes(new Date(), 30),
                pointPrice = 200,
                image = createImage(),
                amount = '1',
                limit = 0,
                isPromoted = true;
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .attach('file', image, {
                    filename: 'test.jpg',
                    contentType: 'image/jpg',
                })
                .field({
                    title,
                    description,
                    image,
                    erc20Id: String(erc20._id),
                    amount,
                    pointPrice,
                    expiryDate: new Date(expiryDate).toISOString(),
                    limit,
                    isPromoted,
                })
                .expect((res: request.Response) => {
                    expect(res.body.uuid).toBeDefined();
                    expect(res.body.title).toBe(title);
                    expect(res.body.description).toBe(description);
                    expect(res.body.image).toBeDefined();
                    expect(res.body.amount).toBe(amount);
                    expect(res.body.pointPrice).toBe(pointPrice);
                    expect(new Date(res.body.expiryDate).getDate()).toBe(expiryDate.getDate());
                    expect(res.body.limit).toBe(limit);
                    expect(res.body.isPromoted).toBe(true);
                })
                .expect(201, done);
        });
    });

    describe('GET /pools/:id/transfer', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/pools/${pool._id}/transfers`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .expect(({ body }: Response) => {
                    expect(body.length).toBe(1);
                    expect(body[0].token).toBeDefined();
                    expect(body[0].sub).toBeDefined();

                    poolTransfer = body[0];
                })
                .expect(200, done);
        });
    });

    describe('GET /pools/:id/transfers/:uuid', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/pools/${pool._id}/transfers/${poolTransfer.token}`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .expect(({ body }: Response) => {
                    expect(body.token).toBe(poolTransfer.token);
                })
                .expect(200, done);
        });
    });

    describe('POST /pools/:id/transfer', () => {
        it('HTTP 403 (Token expired)', async () => {
            await PoolTransfer.findByIdAndUpdate(poolTransfer._id, { expiry: new Date(Date.now() - 10000) });
            await user
                .post(`/v1/pools/${pool._id}/transfers`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .send({ token: poolTransfer.token, sub: sub2 })
                .expect(async ({ body }: Response) => {
                    expect(body.error.message).toBe('This pool transfer URL has expired.');
                })
                .expect(403);
        });
    });

    describe('POST /pools/:id/transfer/refresh', () => {
        it('HTTP 201 (Token refreshed)', async () => {
            await user
                .post(`/v1/pools/${pool._id}/transfers/refresh`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': pool._id })
                .send({ token: poolTransfer.token })
                .expect(201);
        });

        it('HTTP 200 (Pool transferred)', (done) => {
            user.post(`/v1/pools/${pool._id}/transfers`)
                .set({ 'Authorization': dashboardAccessToken2, 'X-PoolId': pool._id })
                .send({ token: poolTransfer.token, sub: sub2 })
                .expect(200, done);
        });
    });

    describe('GET /pools/:id/transfer (after)', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/pools/${pool._id}/transfers`)
                .set({ 'Authorization': dashboardAccessToken2, 'X-PoolId': pool._id })
                .expect(({ body }: Response) => {
                    expect(body.length).toBe(1);
                    expect(body[0].token !== poolTransfer.token).toBeTruthy();
                    expect(body[0].sub).toBe(sub2);
                })
                .expect(200, done);
        });
    });

    describe('GET /erc20/token', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/erc20/token?chainId=${ChainId.Hardhat}`)
                .set({ 'Authorization': dashboardAccessToken2, 'X-PoolId': pool._id })
                .expect(({ body }: Response) => {
                    expect(body.length).toBe(1);
                    expect(body[0].sub).toBe(sub2);
                    expect(body[0].erc20.address).toBe(erc20.address);
                })
                .expect(200, done);
        });
    });
});
