import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').optional().isMongoId(),
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

    res.json(guild);
};

export default { controller, validation };
