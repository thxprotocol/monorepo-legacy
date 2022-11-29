import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import ERC721RewardService from '@thxnetwork/api/services/ERC721RewardService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const reward = await ERC721RewardService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    await ERC721RewardService.remove(reward);
    return res.status(204).end();
};

export default { controller, validation };
