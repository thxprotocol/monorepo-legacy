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

        return { isAuthorized: r.data.isAuthorized, tweets: r.data.tweets, users: r.data.users };
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
}
