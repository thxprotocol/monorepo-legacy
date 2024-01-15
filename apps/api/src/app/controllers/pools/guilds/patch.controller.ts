import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import CreateController from './post.controller';

const validation = [param('guildId').optional().isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const { secret, adminRoleId, channelId } = req.body;
    const guild = await DiscordGuild.findByIdAndUpdate(
        req.params.guildId,
        { secret, channelId, adminRoleId, poolId: req.params.id },
        { new: true },
    );
    res.json(guild);
};

export default { controller, validation };
