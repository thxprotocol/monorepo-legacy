import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validations = [param('discordId')];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const result = await AccountProxy.getByDiscordId(req.params.discordId);
    res.json(result);
};
export default { validations, controller };
