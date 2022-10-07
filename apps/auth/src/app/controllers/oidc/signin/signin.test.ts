import request from 'supertest';
import app from '../../../app';
import { AccountService } from '../../../services/AccountService';
import db from '../../../util/database';
import { API_URL, INITIAL_ACCESS_TOKEN } from '../../../util/secrets';
import { getPath, accountEmail, accountSecret } from '../../../util/jest';
import { AccountVariant } from '../../../types/enums/AccountVariant';

const REDIRECT_URL = 'https://localhost:8082/signin-oidc';
const http = request.agent(app);

describe('Sign In', () => {
    let uid = '',
        Cookies = '';
    let CLIENT_ID = '';
    let CLIENT_SECRET = '';

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
        CLIENT_SECRET = res.body.client_secret;

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

        await account.save();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('GET /auth', () => {
        it('Successfully get uid', async () => {
            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URL,
                resource: API_URL,
                scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write',
                response_type: 'code',
                response_mode: 'query',
                nonce: 'xun4kvy4mh',
            });

            const res = await http.get(`/auth?${params.toString()}`).send();

            expect(res.status).toEqual(303);
            expect(res.header.location).toMatch(new RegExp('/oidc/.*'));

            uid = (res.header.location as string).split('/')[2];
        });

        it('Failed to login with wrong credential', async () => {
            const res = await http
                .post(`/oidc/${uid}/signin`)
                .send('email=fake.user@thx.network&password=thisgoingtofail');

            expect(res.status).toEqual(200);
            expect(res.text).toMatch(new RegExp('.*Could not find an account for this address*'));
        });

        it('Failed to login with wrong password', async () => {
            const res = await http.post(`/oidc/${uid}/signin`).send(`email=${accountEmail}&password=thisgoingtofail`);
            expect(res.status).toEqual(200);
            expect(res.text).toMatch(new RegExp('.*Your provided passwords do not match*'));
        });
    });

    describe('POST /oidc/<uid>/signin', () => {
        describe('Login flow check', () => {
            let redirectUrl = '';
            let code = '';

            it('Successful login with correct information', async () => {
                const res = await http
                    .post(`/oidc/${uid}/signin`)
                    .send(`email=${accountEmail}&password=${accountSecret}`);

                expect(res.status).toEqual(303);

                redirectUrl = getPath(res.header.location);
            });

            it('Redirect to interaction', async () => {
                const res = await http.get(redirectUrl).set('Cookie', Cookies).send();
                expect(res.status).toEqual(303);
                redirectUrl = res.header.location;
                Cookies += res.headers['set-cookie']?.join('; ');
                code = redirectUrl.split('code=')[1].split('&')[0];
            });

            it('Request access token', async () => {
                const res = await http
                    .post('/token')
                    .set({
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
                    })
                    .send({
                        grant_type: 'authorization_code',
                        redirect_uri: REDIRECT_URL,
                        code,
                    });

                expect(res.status).toEqual(200);
            });
        });
    });
});
