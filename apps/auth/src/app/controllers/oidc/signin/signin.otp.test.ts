import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import bcrypt from 'bcrypt';
import { API_URL, DASHBOARD_URL, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { AccountService } from '../../../services/AccountService';
import { mockWalletProxy } from '../../../util/jest/mock';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import TokenService from '@thxnetwork/auth/services/TokenService';

const http = request.agent(app);

describe('Sign In', () => {
    const redirectUri = 'https://localhost:8082/signin-oidc';
    let uid = '',
        clientId = '';

    beforeAll(async () => {
        await db.truncate();

        const res = await http
            .post('/reg')
            .set({ Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}` })
            .send({
                application_type: 'web',
                client_name: 'THX Dashboard',
                grant_types: ['authorization_code'],
                redirect_uris: [redirectUri],
                response_types: ['code'],
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
            });

        clientId = res.body.client_id;

        mockWalletProxy();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('Signup OTP', () => {
        const otp = '00000',
            email = 'fake.user@thx.network';

        it('GET /authorize', async () => {
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                resource: API_URL,
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
                response_type: 'code',
                response_mode: 'query',
                nonce: 'xun4kvy4mh',
                return_url: DASHBOARD_URL,
            });

            const res = await http.get(`/authorize?${params.toString()}`).send();

            expect(res.status).toEqual(303);
            expect(res.header.location).toMatch(new RegExp('/oidc/.*'));

            uid = (res.header.location as string).split('/')[2];
        });

        it('GET /oidc/:uid/signin', async () => {
            const res = await http.get(`/oidc/${uid}/signin`).send();
            expect(res.status).toEqual(200);
            expect(res.text).toMatch(new RegExp('.*Send one-time password*'));
        });

        it('GET /oidc/:uid/signin/otp', async () => {
            const res = await http.post(`/oidc/${uid}/signin`).send(`email=${email}`);
            expect(res.status).toEqual(302);
            expect(res.header.location).toBe(`/oidc/${uid}/signin/otp`);
        });

        it('POST /oidc/:uid/signin/otp (incorrect OTP)', async () => {
            const res = await http.post(`/oidc/${uid}/signin/otp`).send(`otp=12345`);
            expect(res.status).toEqual(200);
            expect(res.text).toMatch(new RegExp('.*Your one-time password is incorrect.*'));
        });

        it('POST /oidc/:uid/signin/otp (correct OTP)', async () => {
            // Override the hashed OTP in db to continue with a deterministic value
            const hashedOtp = await bcrypt.hash(otp, 10);
            const account = await AccountService.getByEmail(email);

            await TokenService.setToken(account, { kind: AccessTokenKind.Auth, accessToken: hashedOtp });

            const res = await http.post(`/oidc/${uid}/signin/otp`).send(`otp=${otp}`);
            expect(res.status).toEqual(303);
        });
    });
});
