import request from 'supertest';
import app from '@thxnetwork/api/';
import { widgetAccessToken, sub, userWalletPrivateKey } from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/types/enums';
import { isAddress } from 'web3-utils';
import { Wallet } from 'ethers';

const user = request.agent(app);

describe('Account Wallet', () => {
    beforeAll(() => beforeAllCallback({ skipWalletCreation: true }));
    afterAll(afterAllCallback);

    let safeAddress;

    it('GET /account', async () => {
        const { body, status } = await user.get('/v1/account').set({ Authorization: widgetAccessToken });
        expect(body.sub).toBe(sub);
        expect(status).toBe(200);
    });

    it('PATCH /account', async () => {
        const authRequestMessage = 'test';
        const authRequestSignature = await (async () => {
            const wallet = new Wallet(userWalletPrivateKey);
            return await wallet.signMessage(authRequestMessage);
        })();
        const { status, body } = await user
            .patch(`/v1/account`)
            .set({ Authorization: widgetAccessToken })
            .send({ authRequestMessage, authRequestSignature });

        expect(body).toBeDefined();
        expect(status).toBe(200);
    });

    it('GET /account/wallet', (done) => {
        user.get(`/v1/account/wallet?chainId=${ChainId.Hardhat}`)
            .set({ Authorization: widgetAccessToken })
            .expect((res: request.Response) => {
                const safe = res.body.find((wallet) => wallet.safeVersion);
                safeAddress = safe.address;
                expect(isAddress(safeAddress)).toBeTruthy();
            })
            .expect(200, done);
    });
});
