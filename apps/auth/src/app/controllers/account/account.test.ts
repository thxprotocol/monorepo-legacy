import request from 'supertest';
import app from '../../app';
import db from '../../util/database';
import { accountAddress, accountEmail } from '../../util/jest';
import { INITIAL_ACCESS_TOKEN } from '@thxnetwork/auth/config/secrets';
import { AccountVariant, AccountPlanType } from '@thxnetwork/common/enums';
import AuthService from '@thxnetwork/auth/services/AuthService';

const http = request.agent(app);

describe('Account Controller', () => {
    let authHeader: string, basicAuthHeader: string, sub: string;

    beforeAll(async () => {
        await db.truncate();

        async function requestToken() {
            const res = await http
                .post('/token')
                .set({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': basicAuthHeader,
                })
                .send({
                    grant_type: 'client_credentials',
                    scope: 'openid accounts:read accounts:write',
                });
            return `Bearer ${res.body.access_token}`;
        }

        async function registerClient() {
            const res = await http
                .post('/reg')
                .set({ Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}` })
                .send({
                    application_type: 'web',
                    client_name: 'THX API',
                    grant_types: ['client_credentials'],
                    redirect_uris: [],
                    response_types: [],
                    scope: 'openid accounts:read accounts:write',
                });

            return 'Basic ' + Buffer.from(`${res.body.client_id}:${res.body.client_secret}`).toString('base64');
        }

        basicAuthHeader = await registerClient();
        authHeader = await requestToken();

        const account = await AuthService.signup({
            plan: AccountPlanType.Lite,
            email: accountEmail,
            variant: AccountVariant.EmailPassword,
            active: true,
        });
        sub = String(account._id);
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /account/:id', () => {
        it('HTTP 200', async () => {
            const res = await http
                .get(`/accounts/${sub}`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.status).toBe(200);
            expect(res.body.email).toBe(accountEmail);
            expect(res.body.variant).toBe(AccountVariant.EmailPassword);
        });
    });

    describe('GET /accounts', () => {
        it('HTTP 200', async () => {
            const res = await http
                .post(`/accounts`)
                .send({
                    subs: JSON.stringify([sub]),
                })
                .set({
                    Authorization: authHeader,
                });
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].email).toBe(accountEmail);
        });
    });

    describe('PATCH /accounts/:id', () => {
        it('HTTP 200', async () => {
            const res = await http
                .patch(`/accounts/${sub}`)
                .set({
                    Authorization: authHeader,
                })
                .send({
                    address: accountAddress,
                });
            expect(res.status).toBe(200);
        });

        it('HTTP 200', async () => {
            const res = await http
                .get(`/accounts/${sub}`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.status).toBe(200);
            expect(res.body.address).toBe(accountAddress);
        });
    });
});
