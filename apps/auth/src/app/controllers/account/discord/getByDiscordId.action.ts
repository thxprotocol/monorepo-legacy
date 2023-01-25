import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { NotFoundError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('discordId')];

const getAccount = async (req: Request, res: Response) => {
    const { discordId } = req.params;
    const account = await AccountService.getByDiscordId(discordId);
    if (!account) throw new NotFoundError();

    return res.json(account.toJSON());
};

export default {
    validation,
    controller: getAccount,
};
