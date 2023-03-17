import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ShopifyPerk } from '@thxnetwork/api/models/ShopifyPerk';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Merchant } from '@thxnetwork/api/models/Merchant';
import { stripe } from '@thxnetwork/api/util/stripe';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Shopify Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool');

    const merchant = await Merchant.findOne({ sub: pool.sub });
    if (!merchant) throw new NotFoundError('Could not find merchant for pool sub');

    const shopifyPerk = await ShopifyPerk.findOne({ uuid: req.params.uuid });
    if (!shopifyPerk) throw new NotFoundError('Could not find this perk');

    const paymentIntent = await stripe.paymentIntents.create({
        amount: shopifyPerk.price,
        currency: shopifyPerk.priceCurrency,
        automatic_payment_methods: { enabled: true },
        application_fee_amount: shopifyPerk.price * 0.05, // 5% is 2.5% app fee and 1.4-3.5% stripe fee
        transfer_data: { destination: merchant.stripeConnectId },
        metadata: {
            sub: req.auth.sub,
            perk_id: String(shopifyPerk._id),
        },
    });

    res.status(201).json({ clientSecret: paymentIntent.client_secret });
};

export default { controller, validation };
