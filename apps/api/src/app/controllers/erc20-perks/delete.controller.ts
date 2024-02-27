import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const reward = await RewardCoinService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    await RewardCoinService.remove(reward);
    return res.status(204).end();
};

export default { controller, validation };
