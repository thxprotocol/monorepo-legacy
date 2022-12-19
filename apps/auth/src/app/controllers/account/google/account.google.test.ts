import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { AccountService } from '../../../services/AccountService';
import { GOOGLE_API_ENDPOINT, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { accountEmail, accountSecret } from '../../../util/jest';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';

const http = request.agent(app);

describe('Account Controller', () => {
    let authHeader: string, basicAuthHeader: string, sub: string;

    beforeEach(() => {
        nock('https://api.airtable.com').post(/.*?/).reply(200, {}); // mock email response for account create method
    });

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
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('POST /account', () => {
        it('HTTP 200', async () => {
            const res = await http
                .post('/account')
                .set({
                    Authorization: authHeader,
                })
                .send({
                    email: accountEmail,
                    password: accountSecret,
                });
            expect(res.status).toBe(201);
            sub = res.body.sub;
        });
    });

    describe('GET /account/:sub/google/youtube', () => {
        let account, nockScopeApi, nockScopeOAuth;
        beforeAll(async () => {
            nockScopeApi = nock(GOOGLE_API_ENDPOINT).persist().get(/.*?/).reply(200, {
                scope: 'https://www.googleapis.com/auth/userinfo.email openid',
            });
            nockScopeOAuth = nock('https://oauth2.googleapis.com/tokeninfo').persist().post(/.*?/).reply(200, {
                scope: 'https://www.googleapis.com/auth/userinfo.email openid',
            });
            nock('https://youtube.googleapis.com/').persist().get(/.*?/).reply(200, { data: {} });
            account = await AccountService.get(sub);
        });

        it('Return isAuthorized = false when account has no Youtube access', async () => {
            const res = await http
                .get(`/account/${sub}/google/youtube`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = false when Youtube access is expired', async () => {
            account.setToken({
                kind: AccessTokenKind.Google,
                accessToken: 'TOKEN',
                refreshToken: 'REFRESH',
                expiry: Date.now() - 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/google/youtube`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = false when Youtube scopes are missing', async () => {
            account.setToken({
                kind: AccessTokenKind.Google,
                accessToken: 'TOKEN',
                refreshToken: 'REFRESH',
                expiry: Date.now() + 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/google/youtube`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = true when account has Youtube access', async () => {
            // Cleaning all mocks and resetting them to the appropriate responses for a successful access check
            nock.cleanAll();

            nock(GOOGLE_API_ENDPOINT).persist(true).get(/.*?/).reply(200, {
                scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube openid',
            });
            nock('https://oauth2.googleapis.com/tokeninfo').persist(true).post(/.*?/).reply(200, {
                scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube openid',
            });
            nock('https://youtube.googleapis.com/').persist().get(/.*?/).reply(200, { data: {} });

            const res = await http
                .get(`/account/${sub}/google/youtube`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });
});
