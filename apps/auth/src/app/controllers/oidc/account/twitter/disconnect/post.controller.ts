import { Request, Response } from 'express';
import { AccountService } from '../../../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import TokenService from '@thxnetwork/auth/services/TokenService';

const controller = async (req: Request, res: Response) => {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    await TokenService.unsetToken(account, AccessTokenKind.Twitter);

    res.redirect(`/oidc/${uid}/account`);
};

export default { controller };
