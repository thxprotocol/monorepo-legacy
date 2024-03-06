import { DiscordGuild } from '@thxnetwork/api/models';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').isMongoId(),
    body('settings.channelId').optional().isString(),
    body('settings.adminRoleId').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const { guildId, name, adminRoleId, channelId } = req.body;
    const guild = await DiscordGuild.create({
        sub: req.auth.sub,
        guildId,
        name,
        channelId,
        adminRoleId,
        poolId: req.params.id,
    });
    const result = await DiscordDataProxy.getGuild({ ...guild.toJSON(), isConnected: true });

    res.json(result);
};

export default { controller, validation };
