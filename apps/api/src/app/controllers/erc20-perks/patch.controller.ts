import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';
import ImageService from '@thxnetwork/api/services/ImageService';
import CreateController from './post.controller';

const validation = [param('id').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    let reward = await RewardCoinService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');

    const image = req.file && (await ImageService.upload(req.file));
    reward = await RewardCoinService.update(reward, { ...req.body, image });

    return res.json(reward.toJSON());
};

export default { controller, validation };
