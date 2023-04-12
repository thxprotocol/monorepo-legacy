import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { GITHUB_API_ENDPOINT, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { accountEmail } from '../../../util/jest';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { AccessTokenKind } from '@thxnetwork/types/index';

const http = request.agent(app);

describe('Account Controller', () => {
    let account: AccountDocument, authHeader: string, basicAuthHeader: string, sub: string;

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

        account = await AccountService.signup({
            email: accountEmail,
            variant: AccountVariant.SSOGithub,
            active: true,
        });
        sub = String(account._id);
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /account/:sub/github', () => {
        beforeAll(async () => {
            nock(GITHUB_API_ENDPOINT)
                .persist()
                .get(/.*?/)
                .reply(200, { data: { data: {} } });
            nock(GITHUB_API_ENDPOINT)
                .persist()
                .post(/.*?/)
                .reply(200, { data: { data: {} } });
        });

        it('Return isAuthorized = false when account has no Twitch access', async () => {
            const res = await http
                .get(`/account/${sub}/github`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = true when account has Twitch access', async () => {
            account.setToken({
                kind: AccessTokenKind.Github,
                accessToken: 'NEWTOKEN',
                expiry: Date.now() + 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/github`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });
});
