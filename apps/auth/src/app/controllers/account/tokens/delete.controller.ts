import TokenService from '@thxnetwork/auth/services/TokenService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Account } from '@thxnetwork/auth/models/Account';
import { AccessTokenKind } from '@thxnetwork/common/enums';

const validation = [param('sub').isMongoId(), param('kind').isString()];

export const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.sub);
    await TokenService.unsetToken(account, req.params.kind as AccessTokenKind);

    res.status(204).end();
};
export default { controller, validation };
