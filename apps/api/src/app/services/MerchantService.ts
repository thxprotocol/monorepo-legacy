import { DASHBOARD_URL } from '../config/secrets';
import { Merchant, MerchantDocument } from '../models/Merchant';
import { stripe } from '../util/stripe';

const create = async (sub: string) => {
    let merchant = await Merchant.findOne({ sub });

    if (!merchant) {
        const account = await stripe.accounts.create({ type: 'express' });

        merchant = await Merchant.create({
            sub,
            stripeConnectId: account.id,
        });
    }

    return merchant;
};

const getAccountLink = async (merchant: MerchantDocument, poolId: string) => {
    return await stripe.accountLinks.create({
        account: merchant.stripeConnectId,
        refresh_url: DASHBOARD_URL + '/reauth.html',
        return_url: `${DASHBOARD_URL}/pool/${poolId}/settings`,
        type: 'account_onboarding',
    });
};

export default { create, getAccountLink };
