import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { AccountService } from '../../../services/AccountService';
import { TWITTER_API_ENDPOINT, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { AccessTokenKind, AccountPlanType } from '@thxnetwork/types/enums';
import { accountEmail } from '@thxnetwork/auth/util/jest';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { mockUrl } from '@thxnetwork/auth/util/jest/mock';

const http = request.agent(app);

describe('Account Controller', () => {
    let authHeader: string, basicAuthHeader: string, sub: string;

    beforeAll(async () => {
        await db.truncate();
        await mockUrl('post', 'https://api.twitter.com', '/2/oauth2/token', 201);

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
            plan: AccountPlanType.Free,
            email: accountEmail,
            variant: AccountVariant.SSOTwitter,
            active: true,
        });
        sub = String(account._id);
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /account/:sub/twitter', () => {
        let account;
        beforeAll(async () => {
            nock(TWITTER_API_ENDPOINT)
                .persist()
                .get(/.*?/)
                .reply(200, { data: { data: {} } });
            account = await AccountService.get(sub);
        });

        it('Return isAuthorized = false when account has no Twitter access', async () => {
            const res = await http
                .get(`/account/${sub}/twitter`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = false when Twitter access is expired', async () => {
            nock.cleanAll();
            account.setToken({
                kind: AccessTokenKind.Twitter,
                accessToken: 'TOKEN',
                refreshToken: 'REFRESH',
                expiry: Date.now() - 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/twitter`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = true when account has Twitter access', async () => {
            account.setToken({
                kind: AccessTokenKind.Twitter,
                accessToken: 'NEWTOKEN',
                expiry: Date.now() + 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/twitter`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });
});
