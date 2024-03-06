import { Request, Response } from 'express';
import { param } from 'express-validator';
import CreateController from './post.controller';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { DiscordGuild } from '@thxnetwork/api/models';

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

export default { controller, validation };
