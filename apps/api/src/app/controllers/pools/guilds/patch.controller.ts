import { Request, Response } from 'express';
import { param } from 'express-validator';
import { DiscordGuild } from '@thxnetwork/api/models';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import * as CreateController from './post.controller';

const validation = [param('guildId').optional().isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const { secret, adminRoleId, channelId } = req.body;
    const guild = await DiscordGuild.findByIdAndUpdate(
        req.params.guildId,
        { secret, channelId, adminRoleId, poolId: req.params.id },
        { new: true },
    );
    const result = await DiscordDataProxy.getGuild({ ...guild.toJSON(), isConnected: true });

    res.json(result);
};

export { controller, validation };
