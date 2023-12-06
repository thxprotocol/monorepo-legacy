import request from 'supertest';
import app from '@thxnetwork/api/';
import ERC20, { ERC20Document } from '@thxnetwork/api/models/ERC20';
import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import {
    dashboardAccessToken,
    userWalletAddress2,
    userWalletPrivateKey,
    widgetAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { toWei } from 'web3-utils';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { poll } from '@thxnetwork/api/util/polling';
import { signTxHash } from '@thxnetwork/api/util/jest/network';

const user = request.agent(app);

describe('ERC20Transfer', () => {
    let erc20: ERC20Document, wallet: WalletDocument;

    beforeAll(beforeAllCallback);
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

    describe('GET /wallet and transfer erc20', () => {
        it('HTTP 201', (done) => {
            user.get('/v1/wallets')
                .set({ Authorization: widgetAccessToken })
                .send()
                .expect(async ({ body }: request.Response) => {
                    expect(body[0].address).toBeDefined();
                    wallet = body[0];
                })
                .expect(200, done);
        });

        it('Transfer ERC20', async () => {
            const { contract } = await ERC20.findById(erc20._id);
            await contract.methods.transfer(wallet.address, toWei('100', 'ether')).send();

            const balanceInWei = await contract.methods.balanceOf(wallet.address).call();
            expect(balanceInWei).toBe(toWei('100', 'ether'));
        });
    });

    describe('POST /erc20/transfer', () => {
        it('HTTP 201', async () => {
            const res = await user
                .post('/v1/erc20/transfer')
                .set({ Authorization: widgetAccessToken })
                .send({
                    erc20Id: erc20._id,
                    to: userWalletAddress2,
                    amount: toWei('1', 'ether'),
                    chainId: ChainId.Hardhat,
                });
            expect(res.body.safeTxHash).toBeDefined();
            expect(res.status).toBe(201);

            const { safeTxHash, signature } = await signTxHash(
                wallet.address,
                res.body.safeTxHash,
                userWalletPrivateKey,
            );
            const res2 = await user
                .post(`/v1/account/wallet/confirm`)
                .set({ Authorization: widgetAccessToken })
                .send({ chainId: ChainId.Hardhat, safeTxHash, signature });

            expect(res2.status).toBe(200);
        });
        it('Wait for balance', async () => {
            const { contract } = await ERC20.findById(erc20._id);
            await poll(
                contract.methods.balanceOf(userWalletAddress2).call,
                (result: string) => result !== toWei('1', 'ether'),
                1000,
            );
            const balanceInWei = await contract.methods.balanceOf(userWalletAddress2).call();
            expect(balanceInWei).toEqual(toWei('1', 'ether'));
        });
    });
});
