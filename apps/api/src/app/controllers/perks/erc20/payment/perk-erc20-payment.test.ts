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
import { fromWei, isAddress, toWei } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes } from '@thxnetwork/api/util/rewards';

const user = request.agent(app);

describe('ERC20 Perk Payment', () => {
    let tokenAddress: string, poolId: string, rewardUuid: string, perkUuid: string;
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
                expect(res.body.archived).toBe(false);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /pools/:id/topup', (done) => {
        const amount = fromWei(totalSupply, 'ether'); // 100 eth
        user.post(`/v1/pools/${poolId}/topup`)
            .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
            .send({ amount })
            .expect(200, done);
    });

    it('POST /point-rewards', (done) => {
        user.post(`/v1/point-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Earn points!',
                description: 'For your engagement',
                amount: 1500,
                platform: 0,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                rewardUuid = res.body.uuid;
            })
            .expect(201, done);
    });

    it('POST /erc20-perks', (done) => {
        const expiryDate = addMinutes(new Date(), 30);
        const image = 'http://myimage.com/1';

        user.post('/v1/erc20-perks/')
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Receive 500 TST tokens',
                description: 'Lorem ipsum dolor sit amet.',
                image,
                amount: 500,
                rewardLimit: 0,
                claimAmount: 1,
                pointPrice: 1500,
                platform: 0,
                expiryDate,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                perkUuid = res.body.uuid;
            })
            .expect(201, done);
    });

    it('POST /rewards/points/:uuid/claim', (done) => {
        user.post(`/v1/rewards/points/${rewardUuid}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(201, done);
    });

    it('POST /perks/erc20/:uuid/payment', (done) => {
        user.post(`/v1/perks/erc20/${perkUuid}/payment`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect((res: request.Response) => {
                expect(res.body.withdrawal).toBeDefined();
                expect(res.body.erc20PerkPayment).toBeDefined();
            })
            .expect(200, done);
    });
});
