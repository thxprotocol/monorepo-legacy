import { Request, Response } from 'express';
import { param } from 'express-validator';
import { RewardDiscordRole } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await RewardDiscordRole.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

export default { controller, validation };
