import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';
import { RewardCustom } from '@thxnetwork/api/models';
import { Webhook } from '@thxnetwork/api/models/Webhook';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import CreateController from './post.controller';

const validation = [param('id').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));
    const webhook = await Webhook.findById(req.body.webhookId);
    if (webhook.poolId !== poolId) throw new ForbiddenError('Not your webhook');

    const customReward = await RewardCustom.findById(req.params.id);
    if (customReward.poolId !== poolId) throw new ForbiddenError('Not your custom reward');

    const reward = await RewardCustom.findByIdAndUpdate(req.params.id, { ...req.body, poolId, image }, { new: true });

    res.status(201).json(reward);
};

export default { controller, validation };
