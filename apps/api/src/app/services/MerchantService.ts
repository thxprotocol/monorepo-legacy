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

const _createPaymentLink = async (stripeConnectId: string, priceId: string, unitAmount: number) => {
    return await stripe.paymentLinks.create({
        line_items: [{ price: priceId, quantity: 1 }],
        on_behalf_of: stripeConnectId,
        application_fee_amount: Math.ceil(unitAmount * 0.025), // 2.5% over price and round up
        transfer_data: { destination: stripeConnectId },
    });
};

const createPaymentLink = async (sub: string, unitAmount: number, priceCurrency: string, perkId: string) => {
    const merchant = await Merchant.findOne({ sub });
    const product = await stripe.products.create({
        name: perkId,
        metadata: {
            perkId,
        },
    });
    const price = await stripe.prices.create({
        product: product.id,
        currency: priceCurrency,
        unit_amount: unitAmount,
    });

    return await _createPaymentLink(merchant.stripeConnectId, price.id, unitAmount);
};

const updatePaymentLink = async (
    sub: string,
    paymentLinkId: string,
    updates: { priceCurrency: string; price: number },
) => {
    // Get price details from line item
    const lineItems = await stripe.paymentLinks.listLineItems(paymentLinkId);
    const lineItemPrice = lineItems.data[0].price;

    // Create new price for product
    const price = await stripe.prices.create({
        product: lineItemPrice.product as string,
        currency: updates.priceCurrency,
        unit_amount: updates.price,
    });

    // Deactivate old price
    await stripe.prices.update(lineItemPrice.id, { active: false });

    // Create new payment link
    const merchant = await Merchant.findOne({ sub });
    const paymentLink = await _createPaymentLink(merchant.stripeConnectId, price.id, updates.price);

    // Deactivate old link
    await stripe.paymentLinks.update(paymentLinkId, { active: false });

    return paymentLink;
};

const removePaymentLink = async (paymentLinkId: string) => {
    const lineItems = await stripe.paymentLinks.listLineItems(paymentLinkId);
    const lineItemPrice = lineItems.data[0].price;

    // Disable product, price and paymentLink as we can not remove them
    await stripe.products.update(lineItemPrice.product as string, { active: false });
    await stripe.prices.update(lineItemPrice.id, { active: false });
    await stripe.paymentLinks.update(paymentLinkId, { active: false });
};

const getPaymentLink = async (paymentLinkId: string) => {
    return await stripe.paymentLinks.retrieve(paymentLinkId);
};

export default {
    create,
    getAccountLink,
    createPaymentLink,
    getPaymentLink,
    updatePaymentLink,
    removePaymentLink,
};
