import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { Request, Response } from 'express';

export const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    const guilds = await DiscordDataProxy.getGuilds(account);
    res.json({ guilds });
};
export default { controller };
