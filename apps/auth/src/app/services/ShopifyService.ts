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
                const tokens = await this.refreshTokens(token.refreshToken);
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
        body.append('code', code);

        const { data } = await shopifyClient({
            url: `${storeUrl}/admin/oauth/access_token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${SHOPIFY_CLIENT_ID}:${SHOPIFY_CLIENT_SECRET}`).toString('base64'),
            },
            data: body,
        });

        const expiry = data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined;

        return {
            tokenInfo: {
                kind: AccessTokenKind.Shopify,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiry,
            },
        };
    }

    static async refreshTokens(refreshToken: string) {
        const data = new URLSearchParams();
        data.append('refresh_token', refreshToken);
        data.append('grant_type', 'refresh_token');
        data.append('client_id', SHOPIFY_CLIENT_ID);

        const r = await shopifyClient({
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

    static getLoginURL() {
        const body = new URLSearchParams();
        body.append('client_id', SHOPIFY_CLIENT_ID);
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/shopify');
        body.append('scope', SHOPIFY_API_SCOPE.join(' '));

        return `/admin/oauth/authorize??${body.toString()}`;
    }

    static async getCustomer(query: { email: string }) {
        const r = await shopifyClient({
            method: 'GET',
            url: '/customers/search.json',
            params: {
                query: `email%3A${query.email}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data;
    }

    static async getCustomerOrders(customerId: number) {
        const r = await shopifyClient({
            method: 'GET',
            url: `/customers/${customerId}/orders.json`,
            // params: {
            //     status: 1, // closed,
            // },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data;
    }

    static async validatePurchase(email: string, amount: string) {
        if (isNaN(Number(amount))) {
            throw new Error('Invalid purchase amount');
        }
        const customer = await this.getCustomer({ email });
        const orders = await this.getCustomerOrders(customer.id);
        if (!orders.length) {
            return false;
        }
        const validOrders = orders.filter(
            (x: any) => x.confirmed && x.cancelled_at === null && Number(x.current_total_price) >= Number(amount),
        );
        return validOrders.length > 0;
    }
}
