import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Merchant } from '@thxnetwork/api/models/Merchant';
import PoolService from '@thxnetwork/api/services/PoolService';
import { stripe } from '@thxnetwork/api/util/stripe';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool');

    const merchant = await Merchant.findOne({ sub: pool.sub });
    if (!merchant) throw new NotFoundError('Could not find merchant for pool sub');

    const erc721Perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!erc721Perk) throw new NotFoundError('Could not find this perk');

    const paymentIntent = await stripe.paymentIntents.create({
        amount: erc721Perk.price,
        currency: erc721Perk.priceCurrency,
        automatic_payment_methods: { enabled: true },
        application_fee_amount: Math.ceil(erc721Perk.price * 0.025),
        transfer_data: { destination: merchant.stripeConnectId },
        metadata: { perkId: erc721Perk._id },
    });

    res.status(201).json({ clientSecret: paymentIntent.client_secret });
};

export default { controller, validation };
