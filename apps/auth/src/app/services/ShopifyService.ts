import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { AUTH_URL, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET } from '../config/secrets';
import { AccountDocument } from '../models/Account';
import { IAccessToken } from '../types/TAccount';
import { shopifyClient } from '../util/axios';

export const SHOPIFY_API_SCOPE = ['read_customers', 'read_orders', 'read_price_rules', 'write_price_rules'];

export class ShopifyService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Shopify);
        if (!token || !token.accessToken) return false;
        return true;
    }

    static async getTokens(storeUrl: string, code: string): Promise<{ tokenInfo: IAccessToken }> {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('client_id', SHOPIFY_CLIENT_ID);

        const { data } = await shopifyClient(storeUrl, {
            url: `${storeUrl}/admin/oauth/access_token`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${SHOPIFY_CLIENT_ID}:${SHOPIFY_CLIENT_SECRET}`).toString('base64'),
            },
            data: body,
        });

        return {
            tokenInfo: {
                kind: AccessTokenKind.Shopify,
                accessToken: data.access_token,
            },
        };
    }

    static async revokeAccess(shopifyStoreUrl: string, accessToken: string) {
        await shopifyClient(shopifyStoreUrl, {
            method: 'DELETE',
            url: shopifyStoreUrl + '/admin/api_permissions/current.json',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });
    }

    static getLoginURL(uid: string, storeUrl = '') {
        const body = new URLSearchParams();
        body.append('client_id', SHOPIFY_CLIENT_ID);
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/shopify');
        body.append('scope', SHOPIFY_API_SCOPE.join(' '));
        body.append('state', uid);

        return storeUrl + `/admin/oauth/authorize?${body.toString()}`;
    }

    static async getEnabledCurrencies(accessToken: string, storeUrl: string) {
        const { data } = await shopifyClient(storeUrl, {
            method: 'GET',
            url: '/currencies.json',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });
        return data.currencies;
    }

    static async getCustomer(accessToken: string, storeUrl: string, query: { email: string }) {
        const { data } = await shopifyClient(storeUrl, {
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
        return data.customers[0];
    }

    static async validateOrderAmount(accessToken: string, storeUrl: string, email: string, amount: number) {
        const customer = await this.getCustomer(accessToken, storeUrl, { email });
        if (!customer) return false;
        return customer.orders_count >= amount;
    }

    static async validateTotalSpent(accessToken: string, storeUrl: string, email: string, amount: number) {
        const customer = await this.getCustomer(accessToken, storeUrl, { email });
        if (!customer) return false;
        return customer.total_spent >= amount;
    }

    static async getDiscountPriceRules(accessToken: string, storeUrl: string) {
        const { data } = await shopifyClient(storeUrl, {
            method: 'GET',
            url: `/price_rules.json`,
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
        });

        return data.price_rules;
    }

    static async createDiscountCode(accessToken: string, storeUrl: string, priceRuleId: string, discountCode: string) {
        const { data } = await shopifyClient(storeUrl, {
            method: 'POST',
            url: `/price_rules/${priceRuleId}/discount_codes.json`,
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            data: { discount_code: { code: discountCode } },
        });
        return data.discount_code;
    }

    static async validateNewsletterSubscription(accessToken: string, storeUrl: string, email: string) {
        const customer = await this.getCustomer(accessToken, storeUrl, { email });
        if (!customer) return false;

        return customer.email_marketing_consent.state === 'subscribed';
    }
}
