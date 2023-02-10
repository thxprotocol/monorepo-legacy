import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { stripe } from '@thxnetwork/api/util/stripe';
import { Merchant } from '@thxnetwork/api/models/Merchant';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool');

    const merchant = await Merchant.findOne({ sub: pool.sub });
    if (!merchant) throw new NotFoundError('Could not find merchant for pool sub');

    const erc721Perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!erc721Perk) throw new NotFoundError('Could not find this perk');

    const paymentLink = await stripe.paymentLinks.create({
        line_items: [
            {
                price: erc721Perk.priceId,
                quantity: 1,
            },
        ],
        on_behalf_of: merchant.stripeConnectId,
        application_fee_amount: 250,
        transfer_data: {
            destination: merchant.stripeConnectId,
        },
    });

    res.status(201).json({ paymentLink });
};

export default { controller, validation };
