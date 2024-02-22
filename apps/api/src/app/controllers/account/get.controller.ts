import { Request, Response } from 'express';
import { TToken } from '@thxnetwork/types/interfaces';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    // Remove actual tokens from response
    account.tokens = account.tokens.map(({ kind, userId, scopes, metadata }) => ({
        kind,
        userId,
        scopes,
        metadata,
    })) as TToken[];

    res.json(account);
};

export default { controller, validation };
