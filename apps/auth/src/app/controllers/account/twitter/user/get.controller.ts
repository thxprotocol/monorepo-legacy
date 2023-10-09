import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/types/index';

export const controller = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const token = account.getToken(AccessTokenKind.Twitter);
    res.json({ userId: token.userId });
};

export default { controller };
