import { Request, Response } from 'express';
import { ERROR_NO_ACCOUNT } from '../../../../../util/messages';
import { AccountService } from '../../../../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/types/enums';
import TokenService from '../../../../../services/TokenService';

const controller = async (req: Request, res: Response) => {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);
    if (!account) throw new Error(ERROR_NO_ACCOUNT);

    for (const kind of [AccessTokenKind.Google, AccessTokenKind.YoutubeView, AccessTokenKind.YoutubeManage]) {
        await TokenService.unsetToken(account, kind);
    }

    res.redirect(`/oidc/${uid}/account`);
};

export default { controller };
