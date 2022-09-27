import nock from 'nock';
import request from 'supertest';
import app from '../../app';
import db from '../../util/database';
import { AccountService } from '../../services/AccountService';
import { INITIAL_ACCESS_TOKEN } from '../../util/secrets';
import { accountAddress, accountEmail, accountSecret } from '../../util/jest';
import { SPOTIFY_API_ENDPOINT, TWITTER_API_ENDPOINT } from '../../util/secrets';

const http = request.agent(app);

describe('Account Controller', () => {
    let authHeader: string, basicAuthHeader: string, accountId: string;

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
                    scope: 'openid account:read account:write',
                });
            return `Bearer ${res.body.access_token}`;
        }

        async function registerClient() {
            const res = await http
                .post('/reg')
                .set({ Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}` })
                .send({
                    application_type: 'web',
                    client_name: 'thx_api',
                    grant_types: ['client_credentials'],
                    redirect_uris: [],
                    response_types: [],
                    scope: 'openid account:read account:write',
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

            accountId = res.body.id;
        });
    });

    describe('GET /account/:id', () => {
        it('HTTP 200', async () => {
            const res = await http
                .get(`/account/${accountId}`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.status).toBe(200);
            expect(res.body.address).toBeDefined();
            expect(res.body.privateKey).toBeDefined();
        });
    });

    describe('PATCH /account/:id', () => {
        it('HTTP 200', async () => {
            const res = await http
                .patch(`/account/${accountId}`)
                .set({
                    Authorization: authHeader,
                })
                .send({
                    address: accountAddress,
                });
            expect(res.status).toBe(204);
        });

        it('HTTP 200', async () => {
            const res = await http
                .get(`/account/${accountId}`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.status).toBe(200);
            expect(res.body.address).toBe(accountAddress);
            expect(res.body.privateKey).toBeDefined();
            // We need to store them for now but still only update address
            // after a transfer of ownership
        });
    });

    describe('POST /account (generate address)', () => {
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
            expect(res.body.id).toBe(accountId);
            expect(res.body.address).toBeDefined();
        });
    });

    describe('GET /account/:sub/twitter', () => {
        beforeAll(async () => {
            nock(SPOTIFY_API_ENDPOINT)
                .persist()
                .get(/.*?/)
                .reply(200, { data: { items: [] } });
            nock(TWITTER_API_ENDPOINT)
                .persist()
                .get(/.*?/)
                .reply(200, { data: { data: {} } });
        });

        it('Denice Access if there no authorization header', async () => {
            const res = await http.get(`/account/${accountId}/twitter`).send();
            expect(res.status).toEqual(401);
        });

        it('Throw Error if there no linked twitter', async () => {
            const res = await http
                .get(`/account/${accountId}/twitter`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Successfully get linked Twitter info with a correct infomation', async () => {
            const account = await AccountService.getByEmail(accountEmail);
            account.twitterAccessToken = 'TOKEN';
            account.twitterRefreshToken = 'REFRESH';
            account.twitterAccessTokenExpires = (Date.now() + 1000000) * 1000;
            await account.save();

            const res = await http
                .get(`/account/${accountId}/twitter`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });

    describe('GET /account/:sub/google/youtube', () => {
        it('Denice Access if there no authorization header', async () => {
            const res = await http.get(`/account/${accountId}/google/youtube`).send();
            expect(res.status).toEqual(401);
        });

        it('Throw Error if there no linked youtube', async () => {
            const res = await http
                .get(`/account/${accountId}/google/youtube`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Successfully get linked Youtube info with a correct infomation', async () => {
            const account = await AccountService.getByEmail(accountEmail);
            account.googleAccessToken = 'TOKEN';
            account.googleRefreshToken = 'REFRESH';
            account.googleAccessTokenExpires = (Date.now() + 1000000) * 1000;
            await account.save();

            const res = await http
                .get(`/account/${accountId}/twitter`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });

    describe('GET /account/:sub/spotify', () => {
        it('Denice Access if there no authorization header', async () => {
            const res = await http.get(`/account/${accountId}/spotify`).send();
            expect(res.status).toEqual(401);
        });

        it('Throw Error if there no linked spotify', async () => {
            const res = await http
                .get(`/account/${accountId}/spotify`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(false);
        });

        it('Successfully get linked Spotify info with a correct infomation', async () => {
            const account = await AccountService.getByEmail(accountEmail);
            account.spotifyAccessToken = 'TOKEN';
            account.spotifyRefreshToken = 'REFRESH';
            account.spotifyAccessTokenExpires = (Date.now() + 1000000) * 1000;
            await account.save();

            const res = await http
                .get(`/account/${accountId}/spotify`)
                .set({
                    Authorization: authHeader,
                })
                .send();
            expect(res.body.isAuthorized).toEqual(true);
        });
    });
});
