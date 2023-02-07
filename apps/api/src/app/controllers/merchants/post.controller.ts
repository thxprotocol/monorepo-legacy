import MerchantService from '@thxnetwork/api/services/MerchantService';
import { Request, Response } from 'express';

const validation = [];
const controller = async (req: Request, res: Response) => {
    const merchant = await MerchantService.create(req.auth.sub);
    res.json(merchant);
};

export default { controller, validation };
