import nock from 'nock';
import request from 'supertest';
import { AccountVariant } from '../../../types/enums/AccountVariant';
import app from '../../../app';
import { AccountService } from '../../../services/AccountService';
import db from '../../../util/database';
import { accountEmail, accountSecret } from '../../../util/jest';
import { API_URL, INITIAL_ACCESS_TOKEN, SPOTIFY_API_ENDPOINT, TWITTER_API_ENDPOINT } from '../../../util/secrets';

const http = request.agent(app);

describe('SSO Sign In', () => {
    let uid = '',
        CLIENT_ID = '';
    const REDIRECT_URL = 'https://localhost:8082/signin-oidc';

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
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write',
            });

        CLIENT_ID = res.body.client_id;

        const signupData = {
            email: accountEmail,
            password: accountSecret,
            variant: AccountVariant.EmailPassword,
            acceptTermsPrivacy: true,
            acceptUpdates: true,
            active: true,
        };
        const account = await AccountService.signup(signupData);
        account.privateKey = undefined;

        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URL,
            resource: API_URL,
            scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write',
            response_type: 'code',
            response_mode: 'query',
            nonce: 'xun4kvy4mh',
        });

        const authRes = await http.get(`/auth?${params.toString()}`).send();

        expect(authRes.status).toEqual(303);
        expect(authRes.header.location).toMatch(new RegExp('/oidc/.*'));

        uid = (authRes.header.location as string).split('/')[2];

        await account.save();
    });

    afterAll(async () => {
        await db.disconnect();
        nock.cleanAll();
    });

    describe('Google SSO', () => {
        beforeAll(async () => {
            nock('https://oauth2.googleapis.com/token')
                .post(/.*?/)
                .reply(200, {
                    id_token:
                        'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZDY4NWY1ZThmYzYyZDc1ODcwNWMxZWIwZThhNzUyNGM0NzU5NzUiLCJ0eXAiOiJKV1QifQ.' +
                        btoa(
                            JSON.stringify({
                                iss: 'https://accounts.google.com',
                                azp: '506948879165-0mkdoln16052qb4gb9318h5hv8rntnv3.apps.googleusercontent.com',
                                aud: '506948879165-0mkdoln16052qb4gb9318h5hv8rntnv3.apps.googleusercontent.com',
                                sub: '116780302581790032921',
                                email: accountEmail,
                                email_verified: true,
                                at_hash: 'PGVG213L9h_mvf8AFAsVtQ',
                                iat: 1657545884,
                                exp: 1657549484,
                            }),
                        ),
                }); // mock email response for account create method
        });
        it('GET /oidc/callback/google', async () => {
            const params = new URLSearchParams({
                code: 'thisnotgonnawork',
                state: uid,
            });
            const res = await http.get('/oidc/callback/google?' + params.toString());

            expect(res.status).toBe(302);
            expect(res.headers['location']).toContain('/auth/');
        });
    });

    describe('Twitter SSO', () => {
        beforeAll(async () => {
            nock(TWITTER_API_ENDPOINT + '/oauth2/token')
                .post(/.*?/)
                .reply(200, {
                    accessToken: 'thisnotgonnawork',
                });
            nock(TWITTER_API_ENDPOINT + '/users/me')
                .get(/.*?/)
                .reply(200, {
                    data: {
                        id: 'thisnotgonnawork',
                    },
                });
        });

        it('GET /oidc/callback/twitter', async () => {
            const params = new URLSearchParams({
                code: 'thisnotgonnawork',
                state: uid,
            });
            const res = await http.get('/oidc/callback/twitter?' + params.toString());

            expect(res.status).toBe(302);
            expect(res.headers['location']).toContain('/auth/');
        });
    });

    describe('Spotify SSO', () => {
        beforeAll(async () => {
            nock('https://accounts.spotify.com/api/token').post(/.*?/).reply(200, {
                accessToken: 'thisnotgonnawork',
            });
            nock(SPOTIFY_API_ENDPOINT + '/me')
                .get(/.*?/)
                .reply(200, {
                    data: {
                        id: 'thisnotgonnawork',
                    },
                });
        });

        it('GET /oidc/callback/spotify', async () => {
            const params = new URLSearchParams({
                code: 'thisnotgonnawork',
                state: uid,
            });
            const res = await http.get('/oidc/callback/spotify?' + params.toString());

            expect(res.status).toBe(302);
            expect(res.headers['location']).toContain('/auth/');
        });
    });
});
