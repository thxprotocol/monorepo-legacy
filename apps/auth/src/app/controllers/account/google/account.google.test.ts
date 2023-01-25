import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { AccountService } from '../../../services/AccountService';
import { GOOGLE_API_ENDPOINT, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { accountEmail, accountSecret } from '../../../util/jest';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { AccountVariant } from '@thxnetwork/auth/types/enums/AccountVariant';

const http = request.agent(app);

describe('Account Controller', () => {
    let authHeader: string, basicAuthHeader: string, sub: string;
    const youtubeViewScopes = 'https://www.googleapis.com/auth/youtube.readonly openid';

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

        const account = await AccountService.signup({
            email: accountEmail,
            variant: AccountVariant.SSOGoogle,
            active: true,
        });
        sub = String(account._id);
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /account/:sub/google/youtube', () => {
        let account;
        beforeAll(async () => {
            nock(GOOGLE_API_ENDPOINT).persist().get(/.*?/).reply(200, {
                scope: youtubeViewScopes,
            });
            nock('https://oauth2.googleapis.com/tokeninfo').persist().post(/.*?/).reply(200, {
                scope: youtubeViewScopes,
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

        it('Return isAuthorized = false when Youtube scopes are missing', async () => {
            nock.cleanAll();
            account.setToken({
                kind: AccessTokenKind.YoutubeView,
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
                scope: youtubeViewScopes,
            });
            nock('https://oauth2.googleapis.com/tokeninfo')
                .persist(true)
                .post(/.*?/)
                .reply(200, {
                    scope: youtubeViewScopes,
                    expiry_date: Date.now() + 3600,
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
