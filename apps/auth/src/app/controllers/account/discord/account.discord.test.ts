import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { DISCORD_API_ENDPOINT } from '../../../config/secrets';
import { AccountService } from '../../../services/AccountService';
import { INITIAL_ACCESS_TOKEN } from '../../../config/secrets';
import { accountEmail } from '../../../util/jest';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { AccountVariant } from '@thxnetwork/auth/types/enums/AccountVariant';

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

        const account = await AccountService.signup({
            email: accountEmail,
            variant: AccountVariant.SSODiscord,
            active: true,
        });
        sub = String(account._id);
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /account/:sub/discord', () => {
        let account;
        beforeAll(async () => {
            nock(DISCORD_API_ENDPOINT)
                .persist()
                .get(/.*?/)
                .reply(200, { data: { data: {} } });
            account = await AccountService.get(sub);
        });

        it('Return isAuthorized = false when account has no Youtube access', async () => {
            const res = await http
                .get(`/account/${sub}/discord`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = false when Youtube access is expired', async () => {
            account.setToken({
                kind: AccessTokenKind.Discord,
                accessToken: 'TOKEN',
                refreshToken: 'REFRESH',
                expiry: Date.now() - 3600,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/discord`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Return isAuthorized = true when account has Youtube access', async () => {
            account.setToken({
                kind: AccessTokenKind.Discord,
                accessToken: 'TOKEN',
                refreshToken: 'TOKEN',
                expiry: Date.now() + 1000,
            });
            await account.save();

            const res = await http
                .get(`/account/${sub}/discord`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });
});
