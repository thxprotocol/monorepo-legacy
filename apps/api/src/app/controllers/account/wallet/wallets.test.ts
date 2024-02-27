import request from 'supertest';
import app from '@thxnetwork/api/';
import { widgetAccessToken, sub, userWalletPrivateKey4 } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import { signMessage } from '@thxnetwork/api/util/jest/network';
import { safeVersion } from '@thxnetwork/api/services/ContractService';

const user = request.agent(app);

describe('Account Wallets', () => {
    beforeAll(() => beforeAllCallback({ skipWalletCreation: true }));
    afterAll(afterAllCallback);

    describe('GET /wallets', () => {
        it('HTTP 200 if OK', (done) => {
            user.get(`/v1/account/wallets`)
                .set({ Authorization: widgetAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(0);
                })
                .expect(200, done);
        });
    });

    // Create Safe Wallet
    describe('POST /wallets (Safe)', () => {
        it('HTTP 200 if OK', (done) => {
            const message = 'test';
            const signature = signMessage(userWalletPrivateKey4, message);
            user.post(`/v1/account/wallets`)
                .set({ Authorization: widgetAccessToken })
                .send({
                    variant: WalletVariant.Safe,
                    message,
                    signature,
                })
                .expect(201, done);
        });
    });

    describe('POST /wallets (WalletConnect)', () => {
        it('HTTP 200 if OK', (done) => {
            const message = 'test';
            const signature = signMessage(userWalletPrivateKey4, message);
            user.post(`/v1/account/wallets`)
                .set({ Authorization: widgetAccessToken })
                .send({
                    variant: WalletVariant.WalletConnect,
                    message,
                    signature,
                })
                .expect(201, done);
        });
    });

    // Create WebConnect wallet

    describe('GET /wallets', () => {
        it('HTTP 200 if OK', (done) => {
            user.get('/v1/account/wallets')
                .set({ Authorization: widgetAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.length).toEqual(2);

                    const safe = res.body.find((wallet: any) => wallet.variant === WalletVariant.Safe);
                    const wallet = res.body.find((wallet: any) => wallet.variant === WalletVariant.WalletConnect);
                    expect(safe.sub).toEqual(sub);
                    expect(safe.chainId).toEqual(ChainId.Hardhat);
                    expect(safe.variant).toBe(WalletVariant.Safe);
                    expect(safe.address).toBeDefined();
                    expect(safe.safeVersion).toBe(safeVersion);

                    expect(wallet.sub).toEqual(sub);
                    expect(wallet.chainId).toEqual(ChainId.Hardhat);
                    expect(wallet.variant).toBe(WalletVariant.WalletConnect);
                    expect(wallet.address).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('POST /wallets', () => {
        //
    });
});
