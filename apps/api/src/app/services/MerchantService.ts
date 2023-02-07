import Stripe from 'stripe';
import { STRIPE_SECRET_TEST_KEY } from '../config/secrets';
import { Merchant } from '../models/Merchant';

export const stripe = new Stripe(STRIPE_SECRET_TEST_KEY, { apiVersion: null });

const create = async (sub: string) => {
    const account = await stripe.accounts.create({ type: 'standard' });
    const merchant = await Merchant.create({
        sub,
        stripeConnectId: account.id,
    });
    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://widget.thx.network/reauth.html',
        return_url: 'https://widget.thx.network/return.html',
        type: 'account_onboarding',
    });

    console.log(account, merchant, accountLink);
    return accountLink;
};

export default { create };
