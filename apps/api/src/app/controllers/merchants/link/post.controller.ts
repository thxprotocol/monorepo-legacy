import { Request, Response } from 'express';
import { Merchant } from '@thxnetwork/api/models/Merchant';
import MerchantService from '@thxnetwork/api/services/MerchantService';

const validation = [];
const controller = async (req: Request, res: Response) => {
    const merchant = await Merchant.findOne({ sub: req.auth.sub });
    const accountLink = await MerchantService.getAccountLink(merchant);

    res.json(accountLink);
};

export default { controller, validation };
