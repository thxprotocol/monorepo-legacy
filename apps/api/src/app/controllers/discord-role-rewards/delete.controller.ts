import { Request, Response } from 'express';
import { param } from 'express-validator';
import { DiscordRoleReward } from '@thxnetwork/api/models/DiscordRoleReward';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await DiscordRoleReward.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

export default { controller, validation };
