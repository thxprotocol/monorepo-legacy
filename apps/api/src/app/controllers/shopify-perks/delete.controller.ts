import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import ShopifyPerkService from '@thxnetwork/api/services/ShopifyPerkService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const reward = await ShopifyPerkService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    await ShopifyPerkService.remove(reward);
    return res.status(204).end();
};

export default { controller, validation };
