import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { RewardDiscordRole } from '@thxnetwork/api/models';
import CreateController from './post.controller';

const validation = [param('id').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));

    const discordRoleReward = await RewardDiscordRole.findById(req.params.id);
    if (discordRoleReward.poolId !== poolId) throw new ForbiddenError('Not your discord role reward');

    const reward = await RewardDiscordRole.findByIdAndUpdate(
        req.params.id,
        { ...req.body, poolId, image },
        { new: true },
    );

    res.status(201).json(reward);
};

export default { controller, validation };
