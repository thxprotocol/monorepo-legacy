import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { NotFoundError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('discordId')];

const controller = async (req: Request, res: Response) => {
    const account = await AccountService.getByDiscordId(req.params.discordId);
    if (!account) throw new NotFoundError('Account not found');
    return res.json(account);
};

export default { validation, controller };
