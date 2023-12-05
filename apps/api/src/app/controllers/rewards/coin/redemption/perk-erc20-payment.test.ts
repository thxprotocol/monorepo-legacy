import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import {
    dashboardAccessToken,
    sub,
    tokenName,
    tokenSymbol,
    widgetAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { fromWei, isAddress, toWei } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes, subMinutes } from '@thxnetwork/api/util/rewards';
import ERC20, { ERC20Document } from '@thxnetwork/api/models/ERC20';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { poll } from '@thxnetwork/api/util/polling';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';

const user = request.agent(app);

describe('ERC20 Perk Payment', () => {
    let erc20: ERC20Document,
        poolId: string,
        perkUuid: string,
        perk: any,
        wallet: WalletDocument,
        campaignSafe: WalletDocument;
    const totalSupply = toWei('100000'),
        amount = 500;

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

    it('POST /pools', async () => {
        wallet = await SafeService.findPrimary(sub, ChainId.Hardhat);
        await user
            .post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect(async (res: request.Response) => {
                expect(res.body.settings.isArchived).toBe(false);
                poolId = res.body._id;
                campaignSafe = await SafeService.findOneByPool(res.body, res.body.chainId);
                await PointBalanceService.add(res.body, wallet._id, 5000);
            })
            .expect(201);
    });

    it('POST /pools/:id/topup', (done) => {
        const amount = fromWei(totalSupply, 'ether'); // 100 eth
        user.post(`/v1/pools/${poolId}/topup`)
            .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
            .send({ erc20Id: erc20._id, amount })
            .expect(200, done);
    });

    it('Wait for balance', async () => {
        const { contract } = await ERC20.findById(erc20._id);
        await poll(
            contract.methods.balanceOf(campaignSafe.address).call,
            (result: string) => result !== totalSupply,
            1000,
        );
        const balanceInWei = await contract.methods.balanceOf(campaignSafe.address).call();
        expect(balanceInWei).toEqual(totalSupply);
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
                amount,
                limit: 1,
                pointPrice: 1500,
                expiryDate,
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
        user.patch(`/v1/erc20-perks/${perk._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({ ...perk, expiryDate: addMinutes(new Date(), 30) })
            .expect(({ body }: request.Response) => {
                perk = body;
            })
            .expect(200, done);
    });

    it('POST /rewards/coin/:uuid/redemption', (done) => {
        user.post(`/v1/rewards/coin/${perkUuid}/redemption`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect((res: request.Response) => {
                console.log(res.body);
                // expect(res.body.tx).toBeDefined();
                expect(res.body.erc20PerkPayment).toBeDefined();
                expect(res.body.erc20PerkPayment.poolId).toBe(poolId);
            })
            .expect(201, done);
    });

    it('Wait for balance', async () => {
        const { contract } = await ERC20.findById(erc20._id);
        const amountInWei = toWei(String(amount), 'ether');
        await poll(contract.methods.balanceOf(wallet.address).call, (result: string) => result !== amountInWei, 1000);
        const balanceInWei = await contract.methods.balanceOf(wallet.address).call();
        expect(balanceInWei).toEqual(amountInWei);
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
