import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import { AccountService } from '../../../services/AccountService';
import db from '../../../util/database';
import { API_URL, INITIAL_ACCESS_TOKEN } from '../../../util/secrets';

const http = request.agent(app);

describe('Sign up', () => {
    let CID = '';
    let CLIENT_ID = '';
    const REDIRECT_URL = 'https://localhost:8082/signin-oidc';
    const NEW_ACCOUNT_EMAIL = 'test@thx.network';
    const NEW_ACCOUNT_PASSWORD = '123asdASD@#@#!!';

    beforeAll(async () => {
        await db.truncate();

        const res = await http
            .post('/reg')
            .set({ Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}` })
            .send({
                application_type: 'web',
                client_name: 'THX Dashboard',
                grant_types: ['authorization_code'],
                redirect_uris: ['https://localhost:8082/signin-oidc'],
                response_types: ['code'],
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write',
            });

        CLIENT_ID = res.body.client_id;
    });

    afterAll(async () => {
        await db.truncate();
        await db.disconnect();
    });

    describe('GET /auth', () => {
        it('Successfully get CID', async () => {
            const params = new URLSearchParams({
                prompt: 'create',
                client_id: CLIENT_ID,
                return_url: 'https://localhost:8082',
                response_type: 'code',
                response_mode: 'query',
                resource: API_URL,
                redirect_uri: REDIRECT_URL,
                scope: 'openid pools:read pools:write rewards:write',
            });

            const res = await http.get(`/auth?${params.toString()}`).send();

            expect(res.status).toEqual(303);
            expect(res.header.location).toMatch(new RegExp('/oidc/.*'));

            CID = (res.header.location as string).split('/')[2];
        });
    });

    describe('POST /oidc/<cid>/signup', () => {
        beforeEach(() => {
            nock('https://api.sendgrid.com').persist().post('/v3/mail/send').reply(200, {}); // mock email response for account create method
            nock('https://api.airtable.com').persist().post('/.*?/').reply(200, {}); // mock email response for account create method
        });

        it('Failed to create account with weak password', async () => {
            const WEAK_PASSWORD = '213456';

            const params = new URLSearchParams({
                email: NEW_ACCOUNT_EMAIL,
                password: WEAK_PASSWORD,
                confirmPassword: WEAK_PASSWORD,
                acceptTermsPrivacy: true as any,
                returnUrl: 'https://localhost:8082',
            });

            const res = await http.post(`/oidc/${CID}/signup`).send(params.toString());

            expect(res.text).toMatch(new RegExp('.*Please enter a strong password.*'));
        });

        it('Failed to create account with empty email', async () => {
            const params = new URLSearchParams({
                email: '',
                password: NEW_ACCOUNT_PASSWORD,
                confirmPassword: NEW_ACCOUNT_PASSWORD,
                acceptTermsPrivacy: true as any,
                returnUrl: 'https://localhost:8082',
            });

            const res = await http.post(`/oidc/${CID}/signup`).send(params.toString());
            expect(res.text).toMatch(new RegExp('.*Email cannot be blank*'));
        });

        it('Failed to create account without accept policy', async () => {
            const NEW_ACCOUNT_EMAIL = 'policy.email@thx.network';
            const params = new URLSearchParams({
                email: NEW_ACCOUNT_EMAIL,
                password: NEW_ACCOUNT_PASSWORD,
                confirmPassword: NEW_ACCOUNT_PASSWORD,
                acceptTermsPrivacy: false as any,
                returnUrl: 'https://localhost:8082',
            });

            const res = await http.post(`/oidc/${CID}/signup`).send(params.toString());
            expect(res.text).toMatch(new RegExp('.*Please accept the terms of use and privacy statement.*'));
        });

        describe('Sign up flow', () => {
            let redirectUrl = '';
            let Cookies = '';

            it('Successfully create an account', async () => {
                const params = new URLSearchParams({
                    email: NEW_ACCOUNT_EMAIL,
                    password: NEW_ACCOUNT_PASSWORD,
                    confirmPassword: NEW_ACCOUNT_PASSWORD,
                    acceptTermsPrivacy: true as any,
                    returnUrl: 'https://localhost:8082',
                });

                const res = await http.post(`/oidc/${CID}/signup`).send(params.toString());

                expect(res.text).toMatch(new RegExp('.*THX for signing up*'));
            });

            it('Create a new Interaction for Signup Verify', async () => {
                const account = await AccountService.getByEmail(NEW_ACCOUNT_EMAIL);
                const signUpKey = account.signupToken;

                const params = new URLSearchParams({
                    client_id: CLIENT_ID,
                    redirect_uri: REDIRECT_URL,
                    response_type: 'code',
                    scope: 'openid asset_pools:read asset_pools:write rewards:write',
                    response_mode: 'query',
                    return_url: 'https://localhost:8082',
                    prompt: 'confirm',
                    signup_token: signUpKey,
                });

                const res = await http.get(`/auth?${params.toString()}`).send();
                expect(res.status).toEqual(303);
                expect(res.header.location).toMatch(new RegExp('/oidc/.*'));
                redirectUrl = res.header.location;
                Cookies += res.headers['set-cookie']?.join('; ');
            });

            it('Redirect to interaction and verify', async () => {
                const res = await http.get(redirectUrl).set('Cookie', Cookies).send();
                expect(res.status).toEqual(302);
                expect(res.header.location).toMatch(new RegExp('/oidc/.*'));
                redirectUrl = res.header.location;
            });

            it('Redirect to signup', async () => {
                const res = await http.get(redirectUrl).set('Cookie', Cookies).send();
                expect(res.status).toEqual(200);
                expect(res.text).toMatch(new RegExp('.*Your e-mail address has been verified.*'));
            });
        });

        it('Failed to create account with registered email', async () => {
            const params = new URLSearchParams({
                email: NEW_ACCOUNT_EMAIL,
                password: NEW_ACCOUNT_PASSWORD,
                confirmPassword: NEW_ACCOUNT_PASSWORD,
                acceptTermsPrivacy: true as any,
                returnUrl: 'https://localhost:8082',
            });

            const res = await http.post(`/oidc/${CID}/signup`).send(params.toString());

            expect(res.text).toMatch(new RegExp('.*An account with this e-mail address already exists*'));
        });
    });
});
