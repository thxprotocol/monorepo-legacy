import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('discordId')];

const getDiscord = async (req: Request, res: Response) => {
    const { discordId } = req.params;
    const account = await AccountService.getByDiscordId(discordId);

    return res.json(account.toJSON());
};

export default {
    validation,
    controller: getDiscord,
};
