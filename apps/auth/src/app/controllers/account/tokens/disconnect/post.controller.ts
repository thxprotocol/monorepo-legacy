import TokenService from '@thxnetwork/auth/services/TokenService';
import { Account } from '@thxnetwork/auth/models/Account';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';

const validation = [param('kind').isString()];

export const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.sub);
    await TokenService.unsetToken(account, req.params.kind as AccessTokenKind);

    res.status(204).end();
};
export default { controller, validation };
