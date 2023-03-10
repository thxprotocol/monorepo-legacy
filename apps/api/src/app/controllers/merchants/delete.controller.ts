import { Merchant } from '@thxnetwork/api/services/MerchantService';
import { Request, Response } from 'express';

const validation = [];
const controller = async (req: Request, res: Response) => {
    const merchant = await Merchant.findOne({ sub: req.auth.sub });
    if (!merchant) return res.end();

    // TODO Proper Stripe cleanup: Get all payment links
    // Remove all line items per link
    // Remove price for line item
    // Remove product for price
    // Remove payment link

    await merchant.delete();

    res.status(204).end();
};

export default { controller, validation };
