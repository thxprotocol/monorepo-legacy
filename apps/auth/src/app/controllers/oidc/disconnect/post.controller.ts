import TokenService from '@thxnetwork/auth/services/TokenService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { AccountService } from '@thxnetwork/auth/services/AccountService';

const validation = [param('sub').isMongoId(), param('kind').isString()];

export const controller = async (req: Request, res: Response) => {
    const { session } = req.interaction;
    const account = await AccountService.get(session.accountId);
    await TokenService.unsetToken(account, req.params.kind as AccessTokenKind);

    res.redirect(`/oidc/${req.params.uid}/account`);
};
export default { controller, validation };
