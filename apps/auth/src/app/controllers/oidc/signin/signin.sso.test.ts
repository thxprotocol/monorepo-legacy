import { DASHBOARD_URL, GITHUB_API_ENDPOINT } from './../../../config/secrets';
import nock from 'nock';
import request from 'supertest';
import { AccountVariant } from '@thxnetwork/common/enums';
import app from '../../../app';
import { AccountService } from '../../../services/AccountService';
import { AccountPlanType } from '@thxnetwork/common/enums';
import db from '../../../util/database';
import { accountEmail } from '../../../util/jest';
import { mockWalletProxy } from '../../../util/jest/mock';
import { API_URL, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';

const http = request.agent(app);

describe('SSO Sign In', () => {
    let uid = '',
        CLIENT_ID = '';
    const REDIRECT_URL = DASHBOARD_URL + '/signin-oidc';

    beforeAll(async () => {
        mockWalletProxy();
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
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
            });

        CLIENT_ID = res.body.client_id;

        const account = await AccountService.create({
            plan: AccountPlanType.Lite,
            email: accountEmail,
            variant: AccountVariant.EmailPassword,
        });
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URL,
            resource: API_URL,
            scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
            response_type: 'code',
            response_mode: 'query',
            nonce: 'xun4kvy4mh',
            return_url: DASHBOARD_URL,
        });

        const authRes = await http.get(`/authorize?${params.toString()}`).send();

        expect(authRes.status).toEqual(303);
        expect(authRes.header.location).toMatch(new RegExp('/oidc/.*'));

        uid = (authRes.header.location as string).split('/')[2];

        await account.save();
    });

    afterAll(async () => {
        await db.disconnect();
        nock.cleanAll();
    });

    // describe('Google SSO', () => {
    //     beforeAll(async () => {
    //         nock('https://oauth2.googleapis.com/token')
    //             .post(/.*?/)
    //             .reply(200, {
    //                 id_token:
    //                     'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFiZDY4NWY1ZThmYzYyZDc1ODcwNWMxZWIwZThhNzUyNGM0NzU5NzUiLCJ0eXAiOiJKV1QifQ.' +
    //                     btoa(
    //                         JSON.stringify({
    //                             iss: 'https://accounts.google.com',
    //                             azp: '506948879165-0mkdoln16052qb4gb9318h5hv8rntnv3.apps.googleusercontent.com',
    //                             aud: '506948879165-0mkdoln16052qb4gb9318h5hv8rntnv3.apps.googleusercontent.com',
    //                             sub: '116780302581790032921',
    //                             email: accountEmail,
    //                             email_verified: true,
    //                             at_hash: 'PGVG213L9h_mvf8AFAsVtQ',
    //                             iat: 1657545884,
    //                             exp: 1657549484,
    //                         }),
    //                     ),
    //             }); // mock response for account create method
    //     });
    //     it('GET /oidc/callback/google', async () => {
    //         const params = new URLSearchParams({
    //             code: 'thisnotgonnawork',
    //             state: Buffer.from(JSON.stringify({ uid })).toString('base64'),
    //         });
    //         const res = await http.get('/oidc/callback/google?' + params.toString());

    //         expect(res.status).toBe(302);
    //         expect(res.headers['location']).toContain('/authorize/');
    //     });
    // });

    // describe('Twitter SSO', () => {
    //     beforeAll(async () => {
    //         nock(TWITTER_API_ENDPOINT + '/oauth2/token')
    //             .post(/.*?/)
    //             .reply(200, {
    //                 accessToken: 'thisnotgonnawork',
    //                 expires_in: 60000,
    //             });
    //         nock(TWITTER_API_ENDPOINT + '/users/me')
    //             .get(/.*?/)
    //             .reply(200, {
    //                 data: {
    //                     id: 'thisnotgonnawork',
    //                 },
    //             });
    //     });

    //     it('GET /oidc/callback/twitter', async () => {
    //         const params = new URLSearchParams({
    //             code: 'thisnotgonnawork',
    //             state: Buffer.from(JSON.stringify({ uid })).toString('base64'),
    //         });
    //         const res = await http.get('/oidc/callback/twitter?' + params.toString());

    //         expect(res.status).toBe(302);
    //         expect(res.headers['location']).toContain('/authorize/');
    //     });
    // });

    describe('Github SSO', () => {
        beforeAll(async () => {
            nock('https://github.com/login/oauth/access_token').post(/.*?/).reply(200, 'access_token=thisnotgonnawork');

            nock(GITHUB_API_ENDPOINT + '/user')
                .get(/.*?/)
                .reply(200, {
                    login: 'GarfDev',
                });
        });

        it('GET /oidc/callback/github', async () => {
            const params = new URLSearchParams({
                code: 'thisnotgonnawork',
                state: Buffer.from(JSON.stringify({ uid })).toString('base64'),
            });
            const res = await http.get('/oidc/callback/github?' + params.toString());

            expect(res.status).toBe(302);
            expect(res.headers['location']).toContain('/authorize/');
        });
    });
});
