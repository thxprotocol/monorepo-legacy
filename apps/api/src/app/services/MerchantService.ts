import { Merchant, MerchantDocument } from '../models/Merchant';
import { stripe } from '../util/stripe';

const create = async (sub: string) => {
    let merchant = await Merchant.findOne({ sub });

    if (!merchant) {
        const account = await stripe.accounts.create({ type: 'standard' });
        console.log(account, account.id);
        merchant = await Merchant.create({
            sub,
            stripeConnectId: account.id,
        });
    }

    return merchant;
};

const getAccountLink = async (merchant: MerchantDocument) => {
    return await stripe.accountLinks.create({
        account: merchant.stripeConnectId,
        refresh_url: 'https://widget.thx.network/reauth.html',
        return_url: 'https://widget.thx.network/return.html',
        type: 'account_onboarding',
    });
};

export default { create, getAccountLink };
