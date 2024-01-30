import { Request, Response } from 'express';
import { ERROR_NO_ACCOUNT } from '../../../../../util/messages';
import { AccountService } from '../../../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import TokenService from '@thxnetwork/auth/services/TokenService';

const controller = async (req: Request, res: Response) => {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);
    if (!account) throw new Error(ERROR_NO_ACCOUNT);

    await TokenService.unsetToken(account, AccessTokenKind.Twitch);

    res.redirect(`/oidc/${uid}/account`);
};

export default { controller };
