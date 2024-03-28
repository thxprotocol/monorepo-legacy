import PriceService from '@thxnetwork/api/services/PriceService';
import { Request, Response } from 'express';

const controller = async (req: Request, res: Response) => {
    const pricing = PriceService.getPricing();
    res.json(pricing);
};

export default { controller };
