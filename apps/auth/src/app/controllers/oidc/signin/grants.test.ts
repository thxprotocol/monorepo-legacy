import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { AccountService } from '../../../services/AccountService';
import { INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { accountEmail } from '../../../util/jest';
import { AccountVariant, AccountPlanType } from '@thxnetwork/common/enums';

const http = request.agent(app);

describe('OAuth2 Grants', () => {
    let authHeader: string, accessToken: string, sub: string;

    beforeAll(async () => {
        await db.truncate();

        const account = await AccountService.create({
            plan: AccountPlanType.Lite,
            email: accountEmail,
            variant: AccountVariant.EmailPassword,
            active: true,
        });
        sub = account._id;
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /.well-known/openid-configuration', () => {
        it('HTTP 200', async () => {
            const res = await http.get('/.well-known/openid-configuration');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /accounts', () => {
        it('HTTP 401 Unauthorized', async () => {
            const res = await http.get('/accounts');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /reg', () => {
        it('HTTP 201', async () => {
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
            authHeader = 'Basic ' + Buffer.from(`${res.body.client_id}:${res.body.client_secret}`).toString('base64');

            expect(res.status).toBe(201);
        });
    });

    describe('GET /token', () => {
        it('HTTP 401 (invalid access token)', async () => {
            const res = await http
                .post('/token')
                .set({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'incorrect authorization code',
                })
                .send({
                    // resource: API_URL,
                    grant_type: 'client_credentials',
                    scope: 'openid accounts:read accounts:write',
                });
            expect(res.status).toBe(400);
            expect(res.body).toMatchObject({
                error: 'invalid_request',
                error_description: 'invalid authorization header value format',
            });
        });
        it('HTTP 401 (invalid grant)', async () => {
            const res = await http
                .post('/token')
                .set({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader,
                })
                .send({
                    grant_type: 'authorization_code',
                    scope: 'openid accounts:read accounts:write',
                });
            expect(res.body).toMatchObject({
                error: 'unauthorized_client',
                error_description: 'requested grant type is not allowed for this client',
            });
            expect(res.status).toBe(400);
        });

        it('HTTP 401 (invalid scope)', async () => {
            const res = await http
                .post('/token')
                .set({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader,
                })
                .send({
                    grant_type: 'client_credentials',
                    scope: 'openid account:read account:write members:read members:write withdrawals:write asset_pools:read asset_pools:write rewards:read withdrawals:read deposits:read deposits:write',
                });
            expect(res.body).toMatchObject({
                error: 'invalid_scope',
                error_description: 'requested scope is not allowed',
                scope: 'account:read',
            });
            expect(res.status).toBe(400);
        });

        it('HTTP 200 (success)', async () => {
            const res = await http
                .post('/token')
                .set({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': authHeader,
                })
                .send({
                    grant_type: 'client_credentials',
                    scope: 'openid accounts:read accounts:write',
                });
            accessToken = res.body.access_token;

            expect(res.status).toBe(200);
            expect(accessToken).toBeDefined();
        });
    });

    describe('GET /account/:id', () => {
        it('HTTP 200', async () => {
            const res = await http
                .get(`/accounts/${sub}`)
                .set({ Authorization: `Bearer ${accessToken}` })
                .send();
            expect(res.status).toBe(200);
        });
    });
});
