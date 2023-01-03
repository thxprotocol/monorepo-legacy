import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let reward = await ERC721PerkService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    reward = await ERC721PerkService.update(reward, { ...req.body });
    return res.json(reward);
};

export default { controller, validation };
