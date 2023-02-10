import { Request, Response } from 'express';
import { stripe } from '@thxnetwork/api/util/stripe';
import { Merchant } from '@thxnetwork/api/models/Merchant';

const controller = async (req: Request, res: Response) => {
    const merchant = await Merchant.findOne({ sub: req.auth.sub });
    const stripeConnectAccount = await stripe.accounts.retrieve(merchant.stripeConnectId);

    res.json({
        ...merchant.toJSON(),
        detailsSubmitted: stripeConnectAccount.details_submitted,
        chargesEnabled: false,
        payoutsEnabled: stripeConnectAccount.payouts_enabled,
    });
};

export default { controller };
