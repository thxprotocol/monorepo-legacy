import nock from 'nock';
import request from 'supertest';
import app from '../../../app';
import db from '../../../util/database';
import { AccountService } from '../../../services/AccountService';
import { API_URL, INITIAL_ACCESS_TOKEN } from '../../../config/secrets';

import { mockWalletProxy } from '@thxnetwork/auth/util/jest/mock';
import { AccessTokenKind } from '@thxnetwork/types/index';
import bcrypt from 'bcrypt';

const http = request.agent(app);

describe('Account Controller', () => {
    let authHeader: string, basicAuthHeader: string, sub: string;
    let uid = '',
        clientId = '';
    const code = 'code';
    const shop = 'dev-thx-store.myshopify.com';
    const redirectUri = 'https://localhost:8082/signin-oidc';

    describe('SSO Sign In', () => {
        beforeAll(async () => {
            await db.truncate();

            const res = await http
                .post('/reg')
                .set({ Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}` })
                .send({
                    application_type: 'web',
                    client_name: 'THX Dashboard',
                    grant_types: ['authorization_code'],
                    redirect_uris: [redirectUri],
                    response_types: ['code'],
                    scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
                });

            clientId = res.body.client_id;

            mockWalletProxy();
        });

        afterAll(async () => {
            await db.disconnect();
        });

        describe('Signup OTP', () => {
            const otp = '00000',
                email = 'fake.user@thx.network';

            it('GET /auth', async () => {
                const params = new URLSearchParams({
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    resource: API_URL,
                    scope: 'openid pools:read pools:write withdrawals:read rewards:write deposits:read deposits:write wallets:read wallets:write',
                    response_type: 'code',
                    response_mode: 'query',
                    nonce: 'xun4kvy4mh',
                });

                const res = await http.get(`/auth?${params.toString()}`).send();

                expect(res.status).toEqual(303);
                expect(res.header.location).toMatch(new RegExp('/oidc/.*'));

                uid = (res.header.location as string).split('/')[2];
            });

            it('GET /oidc/:uid/signin', async () => {
                const res = await http.get(`/oidc/${uid}/signin`).send();
                expect(res.status).toEqual(200);
                expect(res.text).toMatch(new RegExp('.*Send one-time password*'));
            });

            it('GET /oidc/:uid/signin/otp', async () => {
                const res = await http.post(`/oidc/${uid}/signin`).send(`email=${email}`);
                expect(res.status).toEqual(302);
                expect(res.header.location).toBe(`/oidc/${uid}/signin/otp`);
            });

            it('POST /oidc/:uid/signin/otp (correct OTP)', async () => {
                // Override the hashed OTP in db to continue with a deterministic value
                const hashedOtp = await bcrypt.hash(otp, 10);
                const account = await AccountService.getByEmail(email);

                account.setToken({ kind: AccessTokenKind.Auth, accessToken: hashedOtp });
                await account.save();

                const res = await http.post(`/oidc/${uid}/signin/otp`).send(`otp=${otp}`);
                expect(res.status).toEqual(303);
            });
        });

        describe('GET /account/:sub/shopify', () => {
            let account;
            beforeAll(async () => {
                nock('https://dev-thx-store.myshopify.com/admin/oauth/authorize').persist().get(/.*?/).reply(200, {
                    code,
                    shop,
                });
                account = await AccountService.get(sub);
            });

            it('GET /oidc/callback/shopify', async () => {
                const res = await http.get(`/oidc/callback/shopify?code=${code}&state=${uid}&shop=${shop}`);
                expect(res.status).toBe(302);
                expect(res.headers['location']).toContain('/auth/');
            });

            it('GET /account/:sub/shopify/price-rules', (done) => {
                beforeAll(async () => {
                    nock('https://dev-thx-store.myshopify.com/admin/api/2023-01/price_rules.json')
                        .persist()
                        .get(/.*?/)
                        .reply(200, {
                            price_rules: [
                                {
                                    id: 507328175,
                                    value_type: 'fixed_amount',
                                    value: '-10.0',
                                    customer_selection: 'all',
                                    target_type: 'line_item',
                                    target_selection: 'all',
                                    allocation_method: 'across',
                                    allocation_limit: null,
                                    once_per_customer: false,
                                    usage_limit: null,
                                    starts_at: '2023-01-27T09:09:49-05:00',
                                    ends_at: '2023-02-08T09:09:49-05:00',
                                    created_at: '2023-02-02T09:09:49-05:00',
                                    updated_at: '2023-02-02T09:09:49-05:00',
                                    entitled_product_ids: [],
                                    entitled_variant_ids: [],
                                    entitled_collection_ids: [],
                                    entitled_country_ids: [],
                                    prerequisite_product_ids: [],
                                    prerequisite_variant_ids: [],
                                    prerequisite_collection_ids: [],
                                    prerequisite_saved_search_ids: [],
                                    prerequisite_customer_ids: [],
                                    prerequisite_subtotal_range: null,
                                    prerequisite_quantity_range: null,
                                    prerequisite_shipping_price_range: null,
                                    prerequisite_to_entitlement_quantity_ratio: {
                                        prerequisite_quantity: null,
                                        entitled_quantity: null,
                                    },
                                    title: 'SUMMERSALE10OFF',
                                    admin_graphql_api_id: 'gid://shopify/PriceRule/507328175',
                                },
                                {
                                    id: 106886544,
                                    value_type: 'fixed_amount',
                                    value: '-10.0',
                                    customer_selection: 'all',
                                    target_type: 'line_item',
                                    target_selection: 'all',
                                    allocation_method: 'across',
                                    allocation_limit: null,
                                    once_per_customer: false,
                                    usage_limit: null,
                                    starts_at: '2023-01-31T09:09:49-05:00',
                                    ends_at: '2023-02-04T09:09:49-05:00',
                                    created_at: '2023-02-02T09:09:49-05:00',
                                    updated_at: '2023-02-02T09:09:49-05:00',
                                    entitled_product_ids: [],
                                    entitled_variant_ids: [],
                                    entitled_collection_ids: [],
                                    entitled_country_ids: [],
                                    prerequisite_product_ids: [],
                                    prerequisite_variant_ids: [],
                                    prerequisite_collection_ids: [],
                                    prerequisite_saved_search_ids: [],
                                    prerequisite_customer_ids: [],
                                    prerequisite_subtotal_range: null,
                                    prerequisite_quantity_range: null,
                                    prerequisite_shipping_price_range: null,
                                    prerequisite_to_entitlement_quantity_ratio: {
                                        prerequisite_quantity: null,
                                        entitled_quantity: null,
                                    },
                                    title: 'TENOFF',
                                    admin_graphql_api_id: 'gid://shopify/PriceRule/106886544',
                                },
                            ],
                        });
                    account = await AccountService.get(sub);
                });

                http.get(`/account/${sub}/shopify/price-rules`)
                    .set({
                        Authorization: authHeader,
                    })
                    .expect(({ body }: request.Response) => {
                        console.log('body', body);
                    })
                    .expect(200, done);
            });
        });
    });
});
