import { Request, Response } from 'express';
import { AccountService } from '../../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/types/index';
import { TwitterService } from '@thxnetwork/auth/services/TwitterService';

export const controller = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const token = account.getToken(AccessTokenKind.Twitter);
    const user = await TwitterService.getUser(account, token.userId);

    res.json({ userId: token.userId, user });
};

export default { controller };
