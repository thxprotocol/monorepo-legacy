import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import { Request, Response } from 'express';

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const result = await TwitterDataProxy.getTwitter(req.auth.sub);
    res.json(result);
};
export default { controller };
