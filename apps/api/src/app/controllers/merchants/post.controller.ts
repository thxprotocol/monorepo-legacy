import MerchantService from '@thxnetwork/api/services/MerchantService';
import { Request, Response } from 'express';

const validation = [];
const controller = async (req: Request, res: Response) => {
    const accountLink = await MerchantService.create(req.auth.sub);

    res.json({ accountLink });
};

export default { controller, validation };
