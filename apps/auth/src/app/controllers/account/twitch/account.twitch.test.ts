import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { TWITCH_API_ENDPOINT } from '../../../config/secrets';
import { AccountService } from '../../../services/AccountService';
import { INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { accountEmail } from '../../../util/jest';
import { AccessTokenKind, AccountPlanType } from '@thxnetwork/types/enums';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { AccountDocument } from '@thxnetwork/auth/models/Account';

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
            plan: AccountPlanType.Free,
            email: accountEmail,
            variant: AccountVariant.SSOTwitch,
            active: true,
        });

        sub = String(account._id);
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /account/:sub/twitch', () => {
        beforeAll(async () => {
            nock(TWITCH_API_ENDPOINT)
                .persist()
                .get(/.*?/)
                .reply(200, { data: { data: {} } });
            account = await AccountService.get(sub);
        });

        it('Return isAuthorized = false when account has no Twitch access', async () => {
            const res = await http
                .get(`/account/${sub}/twitch`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = false when Twitch access is expired', async () => {
            account.setToken({
                kind: AccessTokenKind.Twitch,
                accessToken: 'TOKEN',
                refreshToken: 'REFRESH',
                expiry: Date.now() - 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/twitch`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = true when account has Twitch access', async () => {
            account.setToken({
                kind: AccessTokenKind.Twitch,
                accessToken: 'NEWTOKEN',
                expiry: Date.now() + 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/twitch`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });
});
