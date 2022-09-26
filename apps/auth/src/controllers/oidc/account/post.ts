import { Request, Response } from 'express';
import { body } from 'express-validator';

import UploadProxy from '../../../proxies/UploadProxy';
import { AccountService } from '../../../services/AccountService';
import { ERROR_NO_ACCOUNT } from '../../../util/messages';

export const validation = [
    body('firstName').optional().isString().isLength({ min: 0, max: 50 }),
    body('lastName').optional().isString().isLength({ min: 0, max: 50 }),
    body('organisation').optional().isString().isLength({ min: 0, max: 50 }),
    body().customSanitizer((val) => {
        return {
            firstName: val.firstName,
            lastName: val.lastName,
            organisation: val.organisation,
        };
    }),
];

export async function controller(req: Request, res: Response) {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);
    const file = (req.files as any)?.profile?.[0] as Express.Multer.File;
    const body = { ...req.body };
    if (!account) throw new Error(ERROR_NO_ACCOUNT);

    if (file) {
        const profileImg = await UploadProxy.post(file);
        body['profileImg'] = profileImg;
    }

    await AccountService.update(account, body);

    res.redirect(`/oidc/${uid}/account`);
}

export default { validation, controller };
