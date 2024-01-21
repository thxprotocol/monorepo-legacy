import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { Request, Response } from 'express';

export const controller = async (req: Request, res: Response) => {
    const result = await DiscordDataProxy.get(req.auth.sub);
    res.json(result);
};
export default { controller };
