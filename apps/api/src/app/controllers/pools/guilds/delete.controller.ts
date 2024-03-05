import { param } from 'express-validator';
import { Request, Response } from 'express';
import { DiscordGuild } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId(), param('guildId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await DiscordGuild.findByIdAndDelete(req.params.guildId);
    res.status(204).end();
};

export default { controller, validation };
