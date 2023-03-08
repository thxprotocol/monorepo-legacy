import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { google } from 'googleapis';
import {
    AUTH_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    SHOPIFY_CLIENT_ID,
    SHOPIFY_CLIENT_SECRET,
} from '../config/secrets';
import { AccountDocument } from '../models/Account';
import { IAccessToken } from '../types/TAccount';
import { shopifyClient } from '../util/axios';

const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_URL + '/oidc/callback/google');

google.options({ auth: client });

const ERROR_NO_DATA = 'Could not find Shopify data for this accesstoken';
const ERROR_NOT_AUTHORIZED = 'Not authorized for Shopify API';
const ERROR_TOKEN_REQUEST_FAILED = 'Failed to request access token';
export const SHOPIFY_API_SCOPE = ['read_customers', 'read_orders'];

export class ShopifyService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Shopify);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const tokens = await this.refreshTokens(account.shopifyStoreUrl, token.refreshToken);
                const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;
                account.setToken({
                    kind: AccessTokenKind.Shopify,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiry,
                });
                await account.save();
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    static async getTokens(storeUrl: string, code: string): Promise<{ tokenInfo: IAccessToken }> {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('client_id', SHOPIFY_CLIENT_ID);
        const r = await shopifyClient(storeUrl, {
            url: `https://${storeUrl}/admin/oauth/access_token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${SHOPIFY_CLIENT_ID}:${SHOPIFY_CLIENT_SECRET}`).toString('base64'),
            },
            data: body,
        });
        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        const expiry = r.data.expires_in ? Date.now() + Number(r.data.expires_in) * 1000 : undefined;

        return {
            tokenInfo: {
                kind: AccessTokenKind.Shopify,
                accessToken: r.data.access_token,
                refreshToken: r.data.refresh_token,
                expiry,
            },
        };
    }

    static async refreshTokens(storeUrl: string, refreshToken: string) {
        const data = new URLSearchParams();
        data.append('refresh_token', refreshToken);
        data.append('grant_type', 'refresh_token');
        data.append('client_id', SHOPIFY_CLIENT_ID);

        const r = await shopifyClient(storeUrl, {
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${SHOPIFY_CLIENT_ID}:${SHOPIFY_CLIENT_SECRET}`).toString('base64'),
            },
            data,
        });

        if (r.status !== 200) throw new Error(ERROR_TOKEN_REQUEST_FAILED);

        return r.data;
    }

    static async revokeAccess(storeUrl: string, accessToken: string) {
        await shopifyClient(storeUrl, {
            method: 'DELETE',
            url: storeUrl + '/admin/api_permissions/current.json',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });
    }

    static getLoginURL(uid: string) {
        const body = new URLSearchParams();
        body.append('client_id', SHOPIFY_CLIENT_ID);
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/shopify');
        body.append('scope', SHOPIFY_API_SCOPE.join(' '));
        body.append('state', uid);

        return `/admin/oauth/authorize?${body.toString()}`;
    }

    static async getCustomer(accessToken: string, storeUrl: string, query: { email: string }) {
        const r = await shopifyClient(storeUrl, {
            method: 'GET',
            url: '/customers/search.json',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            params: {
                query: `email:${query.email}`,
            },
        });
        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data.customers[0];
    }

    static async getCustomerOrders(accessToken: string, storeUrl: string, customerId: number) {
        const r = await shopifyClient(storeUrl, {
            method: 'GET',
            url: `/customers/${customerId}/orders.json`,
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);
        return r.data.orders;
    }

    static async validatePurchase(accessToken: string, storeUrl: string, email: string, amount: string) {
        if (isNaN(Number(amount))) {
            throw new Error('Invalid purchase amount');
        }
        const customer = await this.getCustomer(accessToken, storeUrl, { email });
        const orders = await this.getCustomerOrders(accessToken, storeUrl, customer.id);

        if (!orders.length) {
            return false;
        }

        const validOrders = orders.filter(
            (x: any) => x.confirmed && x.cancelled_at === null && Number(x.current_total_price),
        );
        const totalOrderPurchased = validOrders
            .map((x: any) => x.current_total_price)
            .reduce((a: string, b: string) => Number(a) + Number(b));
        return totalOrderPurchased >= Number(amount);
    }
}
