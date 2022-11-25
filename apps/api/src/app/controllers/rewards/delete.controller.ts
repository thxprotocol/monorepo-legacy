import RewardService from '@thxnetwork/api/services/RewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await RewardService.get(req.assetPool, req.params.id);
    if (!reward) throw new NotFoundError('Could not find reward for this id');
    await RewardService.delete(reward);
    return res.status(200).send();
};

export default { validation, controller };
