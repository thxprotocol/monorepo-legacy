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
    console.log(account, merchant);
};

export default { create };
