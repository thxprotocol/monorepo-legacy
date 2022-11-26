import ERC721RewardService from '@thxnetwork/api/services/ERC721RewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [param('id').exists(), body('isClaimOnce').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let reward = await ERC721RewardService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    reward = await ERC721RewardService.update(reward, req.body);
    return res.json(reward);
};

export default { controller, validation };
