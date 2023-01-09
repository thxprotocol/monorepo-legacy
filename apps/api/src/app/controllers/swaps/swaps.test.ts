import request, { Response } from 'supertest';
import app from '@thxnetwork/api/';
import { Account } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { isAddress, fromWei, toWei, toChecksumAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId, ERC20Type } from '@thxnetwork/api/types/enums';
import {
    getAbiForContractName,
    getByteCodeForContractName,
    getContractFromName,
} from '@thxnetwork/api/config/contracts';
import {
    adminAccessToken,
    dashboardAccessToken,
    MaxUint256,
    userWalletPrivateKey2,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import { getProvider } from '@thxnetwork/api/util/network';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { SwapState } from '@thxnetwork/api/types/enums/SwapState';
import { InsufficientBalanceError } from '@thxnetwork/api/util/errors';
import { PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';

const http = request.agent(app);

describe('Swaps', () => {
    let userWallet: Account,
        admin: Account,
        erc20: ERC20Document,
        swaprule: any,
        swap: any,
        testTokenA: Contract,
        testTokenB: Contract,
        totalSupplyTokenA: string,
        totalSupplyTokenB: string,
        poolAddress: string,
        poolId: string,
        amountIn: number,
        tokenAddress: string,
        tokenInAddress: string,
        tokenMultiplier: number;

    beforeAll(async () => {
        await beforeAllCallback();

        amountIn = 10;
        tokenMultiplier = 10;
        userWallet = createWallet(userWalletPrivateKey2);
        const { defaultAccount } = getProvider(ChainId.Hardhat);
        admin = { privateKey: PRIVATE_KEY, address: defaultAccount } as Account;
    });

    afterAll(afterAllCallback);

    it('Create TOKEN A ', (done) => {
        totalSupplyTokenA = fromWei('1000000000000000000000', 'ether'); // 1000 eth
        http.post('/v1/erc20')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                name: 'TOKEN A',
                symbol: 'TKNA',
                type: ERC20Type.Limited,
                totalSupply: totalSupplyTokenA,
            })
            .expect(async ({ body }: request.Response) => {
                expect(isAddress(body.address)).toBe(true);
                erc20 = body;
                tokenAddress = body.address;
                testTokenA = getContractFromName(ChainId.Hardhat, 'LimitedSupplyToken', tokenAddress);
                const adminBalance = await testTokenA.methods.balanceOf(admin.address).call();
                expect(fromWei(String(adminBalance), 'ether')).toBe(totalSupplyTokenA);
            })
            .expect(201, done);
    });

    it('DEPLOY TOKEN B (TOKEN IN)', async () => {
        totalSupplyTokenB = fromWei('400000000000000000000', 'ether'); // 400 eth

        testTokenB = await TransactionService.deploy(
            getAbiForContractName('LimitedSupplyToken'),
            getByteCodeForContractName('LimitedSupplyToken'),
            ['TOKEN B', 'TKNB', userWallet.address, toWei(String(totalSupplyTokenB))],
            ChainId.Hardhat,
        );

        tokenInAddress = testTokenB.options.address;
    });

    // it('import token', (done) => {
    //     http.post('/v1/erc20/token')
    //         .set('Authorization', dashboardAccessToken)
    //         .send({
    //             address: testTokenB.options.address,
    //             chainId: ChainId.Hardhat,
    //         })
    //         .expect(201, done);
    // });

    it('Create pool for TOKEN A', (done) => {
        http.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect(async (res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolAddress = res.body.address;
                poolId = res.body._id;
                const adminBalance = await testTokenA.methods.balanceOf(admin.address).call();
                const poolBalance = await testTokenA.methods.balanceOf(poolAddress).call();
                expect(String(poolBalance)).toBe('0');
                expect(fromWei(String(adminBalance), 'ether')).toBe(totalSupplyTokenA);
            })
            .expect(201, done);
    });

    it('Approve for infinite amount: ALLOW TRANSFER TOKEN A FROM ADMIN TO POOL', async () => {
        const tx = await testTokenA.methods.approve(poolAddress, MaxUint256).send({ from: admin.address });
        const event: any = Object.values(tx.events).filter((e: any) => e.event === 'Approval')[0];
        expect(event.returnValues.owner).toEqual(admin.address);
        expect(event.returnValues.spender).toEqual(poolAddress);
        expect(event.returnValues.value).toEqual(String(MaxUint256));
    });

    it('POST /pools/:id/topup/ 200 OK', (done) => {
        const amount = fromWei('500000000000000000000', 'ether'); // 500 eth
        http.post(`/v1/pools/${poolId}/topup`)
            .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
            .send({ erc20Id: erc20._id, amount })
            .expect(async () => {
                const adminBalance = await testTokenA.methods.balanceOf(admin.address).call();
                const poolBalance = await testTokenA.methods.balanceOf(poolAddress).call();
                expect(String(poolBalance)).toBe('500000000000000000000'); // 500 eth
                expect(String(adminBalance)).toBe('500000000000000000000'); // 500 eth
            })
            .expect(200, done);
    });

    it('POST /swaprules', (done) => {
        http.post('/v1/swaprules')
            .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
            .send({
                tokenInAddress,
                tokenMultiplier,
            })
            .expect(({ body }: Response) => {
                expect(body._id).toBeDefined();
                expect(body.tokenInId).toBeDefined();
                expect(body.tokenMultiplier).toEqual(tokenMultiplier);
                swaprule = body;
            })
            .expect(200, done);
    });

    it('Approve for infinite amount: ALLOW TRANSFER TOKEN B FROM USER WALLET TO POOL', async () => {
        const tx = await testTokenB.methods
            .approve(toChecksumAddress(poolAddress), MaxUint256)
            .send({ from: toChecksumAddress(userWallet.address) });
        const event: any = Object.values(tx.events).filter((e: any) => e.event === 'Approval')[0];
        expect(event.returnValues.owner).toEqual(userWallet.address);
        expect(event.returnValues.spender).toEqual(poolAddress);
        expect(event.returnValues.value).toEqual(String(MaxUint256));
    });

    it('POST /swaps 200 OK', async () => {
        await http
            .post('/v1/swaps')
            .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
            .send({ amountIn, erc20Id: erc20._id, swapRuleId: swaprule._id })
            .expect(({ body }: Response) => {
                expect(body._id).toBeDefined();
                expect(body.amountIn).toEqual(String(amountIn));
                expect(body.swapRuleId).toEqual(swaprule._id);
                expect(body.amountOut).toEqual(String(amountIn * tokenMultiplier));
                expect(body.state).toEqual(SwapState.Completed);
                swap = body;
            })
            .expect(200);
    });

    it('POST /swaps 400 Bad Request (InsufficientBalanceError)', async () => {
        const wrongAmountIn = toWei('1000', 'ether');
        await http
            .post('/v1/swaps')
            .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
            .send({ amountIn: wrongAmountIn, erc20Id: erc20._id, swapRuleId: swaprule._id })
            .expect(({ body }: Response) => {
                expect(body.error.message).toEqual(new InsufficientBalanceError().message);
            })
            .expect(400);
    });

    it('GET /swaps 200 OK', (done) => {
        http.get('/v1/swaps')
            .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
            .expect(({ body }: Response) => {
                expect(body[0]._id).toEqual(swap._id);
                expect(body[0].amountIn).toEqual(swap.amountIn);
                expect(body[0].swapRuleId).toEqual(swap.swapRuleId);
                expect(body[0].amountOut).toEqual(swap.amountOut);
                expect(body[0].state).toEqual(swap.state);
            })
            .expect(200, done);
    });

    it('GET /swaps/:id', (done) => {
        http.get('/v1/swaps/' + swap._id)
            .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
            .expect(({ body }: Response) => {
                expect(body._id).toEqual(swap._id);
                expect(body.amountIn).toEqual(swap.amountIn);
                expect(body.swapRuleId).toEqual(swap.swapRuleId);
                expect(body.amountOut).toEqual(swap.amountOut);
                expect(body.state).toEqual(swap.state);
            })
            .expect(200, done);
    });

    it('GET /swaps/:id 400 (Bad Input)', (done) => {
        http.get('/v1/swaps/' + 'invalid_id')
            .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
            .expect(({ body }: Response) => {
                expect(body.errors).toHaveLength(1);
                expect(body.errors[0].param).toEqual('id');
                expect(body.errors[0].msg).toEqual('Invalid value');
            })
            .expect(400, done);
    });

    it('GET /swaps/:id 404 Not Found', (done) => {
        http.get('/v1/swaps/' + '6208dfa33400429348c5e61b')
            .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
            .expect(({ body }: Response) => {
                expect(body.error.message).toEqual('Could not find this Swap');
            })
            .expect(404, done);
    });
});
