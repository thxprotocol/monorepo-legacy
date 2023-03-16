import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Wallet } from '@thxnetwork/api/models/Wallet';

const validations = [param('discordId')];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const account = await AccountProxy.getByDiscordId(req.params.discordId);
    const wallets = await Wallet.find({ sub: account.sub });

    res.json({ account, wallets });
};
export default { validations, controller };
