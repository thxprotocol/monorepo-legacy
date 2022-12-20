import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { NotFoundError } from '@thxnetwork/auth/util/errors';
import { Request, Response } from 'express';

import { AccountService } from '../../../services/AccountService';
import { TwitterService } from '../../../services/TwitterService';

export const getTwitterFollow = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Twitter);
    if (!token) {
        throw new NotFoundError();
    }
    const result = await TwitterService.validateFollow(token.accessToken, req.params.item);

    res.json({
        result,
    });
};
