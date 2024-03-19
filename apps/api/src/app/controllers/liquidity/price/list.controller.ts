import { BALANCER_POOL_ID } from '@thxnetwork/api/config/secrets';
import BalancerService from '@thxnetwork/api/services/BalancerService';
import { Request, Response } from 'express';

const controller = async (req: Request, res: Response) => {
    const pricing = await BalancerService.getPricing(BALANCER_POOL_ID);
    res.json(pricing);
};

export default { controller };
