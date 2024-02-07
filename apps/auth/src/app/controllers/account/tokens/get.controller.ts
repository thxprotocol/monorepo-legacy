import TokenService from '@thxnetwork/auth/services/TokenService';
import { Account } from '@thxnetwork/auth/models/Account';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';

const validation = [param('sub').isMongoId(), param('kind').isString()];

export const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.sub);
    const kind = req.params.kind as AccessTokenKind;
    const token = await TokenService.getToken(account, kind);

    res.json(token);
};
export default { controller, validation };
