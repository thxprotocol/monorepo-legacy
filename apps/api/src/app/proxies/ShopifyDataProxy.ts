import type { IAccount } from '@thxnetwork/api/models/Account';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';

class NoShopifyPurchaseDataError extends THXError {
    message = 'Could not find a purchase';
}

export default class ShopifyDataProxy {
    static async getShopify(sub: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}/shopify`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (r.status !== 200) throw new NoShopifyPurchaseDataError();
        if (!r.data) throw new NoShopifyPurchaseDataError();

        return { isAuthorized: r.data.isAuthorized };
    }

    static async validatePurchase(account: IAccount, content: string) {
        const amount = JSON.parse(content).amount;

        const r = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/shopify/purchase?amount=${amount}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoShopifyPurchaseDataError();

        return r.data.result;
    }

    static async getPriceRules(account: IAccount) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/shopify/price-rules`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new THXError('Could not find a price rule');

        return r.data;
    }

    static async createDiscountCode(account: IAccount, priceRuleId: string, discountCode: string) {
        const r = await authClient({
            method: 'POST',
            url: `/account/${account.sub}/shopify/discount-code`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
            data: { priceRuleId, discountCode },
        });

        if (!r.data) throw new THXError('Could not create a discount code');

        return r.data;
    }
}
