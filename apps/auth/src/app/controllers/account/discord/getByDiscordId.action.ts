import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('discordId')];

const controller = async (req: Request, res: Response) => {
    const account = await AccountService.getByDiscordId(req.params.discordId);
    return res.json(account);
};

export default { validation, controller };
