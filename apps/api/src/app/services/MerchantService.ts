import { DASHBOARD_URL } from '../config/secrets';
import { Merchant as MerchantModel, MerchantDocument } from '../models/Merchant';
import { stripe } from '../util/stripe';

export const Merchant = MerchantModel;

const create = async (sub: string) => {
    let merchant = await Merchant.findOne({ sub });

    if (!merchant) {
        const account = await stripe.accounts.create({ type: 'standard' });

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
        refresh_url: `${DASHBOARD_URL}/pool/${poolId}/settings`,
        return_url: `${DASHBOARD_URL}/pool/${poolId}/settings`,
        type: 'account_onboarding',
    });
};

export default {
    create,
    getAccountLink,
};
