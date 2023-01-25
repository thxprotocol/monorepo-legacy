import request from 'supertest';
import app from '../../../app';
import { AccountService } from '../../../services/AccountService';
import db from '../../../util/database';
import { API_URL, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { getPath, accountEmail, accountSecret } from '../../../util/jest';
import { AccountVariant } from '../../../types/enums/AccountVariant';
import { ChainId } from '../../../types/enums/chainId';
import { mockWalletProxy } from '../../../util/jest/mock';

const REDIRECT_URL = 'https://localhost:8082/signin-oidc';
const http = request.agent(app);

describe('Sign In', () => {
    let uid = '',
        Cookies = '';
    let CLIENT_ID = '';
    let CLIENT_SECRET = '';

    beforeAll(async () => {
        await db.truncate();
        const res = await http
            .post('/reg')
            .set({ Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}` })
            .send({
                application_type: 'web',
                client_name: 'THX Dashboard',
                grant_types: ['authorization_code'],
                redirect_uris: [REDIRECT_URL],
                response_types: ['code'],
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
            });

        CLIENT_ID = res.body.client_id;
        CLIENT_SECRET = res.body.client_secret;

        await AccountService.signup({
            email: accountEmail,
            variant: AccountVariant.EmailPassword,
            active: true,
        });
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('Signin OTP', () => {
        it('GET /oidc/:uid/signin', async () => {
            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URL,
                resource: API_URL,
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
                response_type: 'code',
                response_mode: 'query',
                nonce: 'xun4kvy4mh',
            });

            const res = await http.get(`/auth?${params.toString()}`).send();

            expect(res.status).toEqual(303);
            expect(res.header.location).toMatch(new RegExp('/oidc/.*'));

            uid = (res.header.location as string).split('/')[2];
        });

        it('GET /oidc/:uid/signin/otp', async () => {
            const res = await http.post(`/oidc/${uid}/signin`).send(`email=fake.user@thx.network`);
            expect(res.status).toEqual(302);
            expect(res.header.location).toBe(`/oidc/${uid}/signin/otp`);
        });

        it('POST /oidc/:uid/signin/otp', async () => {
            const res = await http.post(`/oidc/${uid}/signin/otp`).send('otp=00000');
            expect(res.status).toEqual(200);
            expect(res.text).toMatch(new RegExp('.*Your one-time password is incorrect.*'));
        });
    });
});
