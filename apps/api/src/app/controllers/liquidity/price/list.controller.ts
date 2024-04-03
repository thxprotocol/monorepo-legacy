import BalancerService from '@thxnetwork/api/services/BalancerService';
import { Request, Response } from 'express';

const controller = async (req: Request, res: Response) => {
    const pricing = BalancerService.getPricing();
    res.json(pricing);
};

export default { controller };
