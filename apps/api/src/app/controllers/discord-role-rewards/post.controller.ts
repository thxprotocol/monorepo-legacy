import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';
import { DiscordRoleReward } from '@thxnetwork/api/models/DiscordRoleReward';
import { body } from 'express-validator';
import { v4 } from 'uuid';
import { defaults } from '@thxnetwork/api/util/validation';

const validation = [...defaults.reward, body('discordRoleId').optional().isString()];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));
    const reward = await DiscordRoleReward.create({ ...req.body, uuid: v4(), poolId, image });

    res.status(201).json(reward);
};

export default { controller, validation };
