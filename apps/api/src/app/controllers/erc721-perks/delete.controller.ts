import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import RewardNFTService from '@thxnetwork/api/services/RewardNFTService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const perk = await RewardNFTService.get(req.params.id);
    if (!perk) throw new NotFoundError('Could not find the reward');
    await RewardNFTService.remove(perk);
    return res.status(204).end();
};

export default { controller, validation };
