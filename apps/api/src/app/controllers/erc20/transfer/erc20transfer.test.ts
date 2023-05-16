import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import {
    authAccessToken,
    dashboardAccessToken,
    sub,
    userWalletAddress2,
    widgetAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { toWei } from 'web3-utils';
import ERC20, { ERC20Document } from '@thxnetwork/api/models/ERC20';
import { ERC20TransferDocument } from '@thxnetwork/api/models/ERC20Transfer';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const user = request.agent(app);

describe('ERC20Transfer', () => {
    let erc20: ERC20Document, wallet: WalletDocument, erc20Transfer: ERC20TransferDocument;

    beforeAll(async () => await beforeAllCallback({ skipWalletCreation: true }));
    afterAll(afterAllCallback);

    describe('POST /erc20', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .send({
                    name: 'Test Token',
                    symbol: 'TTK',
                    totalSupply: toWei('100', 'ether'),
                    type: ERC20Type.Limited,
                    chainId: ChainId.Hardhat,
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    erc20 = body;
                })
                .expect(201, done);
        });
    });

    describe('POST /wallet', () => {
        it('HTTP 201', (done) => {
            user.post(`/v1/wallets`)
                .set({ Authorization: authAccessToken })
                .send({
                    sub,
                    chainId: ChainId.Hardhat,
                    forceSync: true,
                })
                .expect(async ({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.address).toBeDefined();
                    wallet = body;
                })
                .expect(201, done);
        });

        it('Transfer ERC20', async () => {
            const { contract } = await ERC20.findById(erc20._id);
            await TransactionService.sendAsync(
                contract.options.address,
                contract.methods.transfer(wallet.address, toWei('10', 'ether')),
                ChainId.Hardhat,
            );
            const balanceInWei = await contract.methods.balanceOf(wallet.address).call();
            expect(balanceInWei).toBe(toWei('10', 'ether'));
        });
    });

    describe('POST /erc20/transfer', () => {
        it('HTTP 201', (done) => {
            user.post('/v1/erc20/transfer')
                .set({ Authorization: widgetAccessToken })
                .send({
                    erc20Id: erc20._id,
                    to: userWalletAddress2,
                    amount: toWei('1', 'ether'),
                    chainId: ChainId.Hardhat,
                })
                .expect(async ({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.erc20Id).toBeDefined();
                    expect(body.from).toEqual(wallet.address);
                    expect(body.to).toEqual(userWalletAddress2);
                    expect(body.chainId).toEqual(ChainId.Hardhat);
                    expect(body.transactionId).toBeDefined();
                    expect(body.sub).toEqual(sub);

                    erc20Transfer = body;

                    const { contract } = await ERC20.findById(erc20._id);
                    const balanceInWei = await contract.methods.balanceOf(userWalletAddress2).call();

                    expect(balanceInWei).toEqual(toWei('1', 'ether'));
                })
                .expect(201, done);
        });
    });

    describe('GET /erc20/transfer/:id', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/erc20/transfer/${erc20Transfer._id}`)
                .set({ Authorization: widgetAccessToken })
                .expect(({ body }: request.Response) => {
                    expect(body.erc20Id).toBeDefined();
                    expect(body.from).toEqual(wallet.address);
                    expect(body.to).toEqual(userWalletAddress2);
                    expect(body.chainId).toEqual(ChainId.Hardhat);
                    expect(body.transactionId).toBeDefined();
                    expect(body.sub).toEqual(sub);
                })
                .expect(200, done);
        });
    });

    describe('GET /erc20/transfer?erc20=:address&chainId=:chainId', () => {
        it('HTTP 200', (done) => {
            user.get(`/v1/erc20/transfer?erc20Id=${erc20._id}&chainId=${ChainId.Hardhat}`)
                .set({ Authorization: widgetAccessToken })
                .expect(async ({ body }: request.Response) => {
                    expect(body.length).toEqual(1);
                    expect(body[0].erc20Id).toBeDefined();
                    expect(body[0].from).toEqual(wallet.address);
                    expect(body[0].to).toEqual(userWalletAddress2);
                    expect(body[0].chainId).toEqual(ChainId.Hardhat);
                    expect(body[0].transactionId).toBeDefined();
                    expect(body[0].sub).toEqual(sub);

                    const { contract } = await ERC20.findById(erc20._id);
                    const balanceInWei = await contract.methods.balanceOf(userWalletAddress2).call();
                    expect(balanceInWei).toEqual(toWei('1', 'ether'));
                })
                .expect(200, done);
        });
    });
});
