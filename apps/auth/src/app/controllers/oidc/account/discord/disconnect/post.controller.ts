import { Request, Response } from 'express';
import { AccountService } from '../../../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';
import TokenService from '../../../../../services/TokenService';

const controller = async (req: Request, res: Response) => {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    await TokenService.unsetToken(account, AccessTokenKind.Github);

    res.redirect(`/oidc/${uid}/account`);
};

export default { controller };
