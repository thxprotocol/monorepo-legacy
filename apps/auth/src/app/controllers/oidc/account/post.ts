import { Request, Response } from 'express';
import { body } from 'express-validator';
import { MailService } from '../../../services/MailService';

import UploadProxy from '../../../proxies/UploadProxy';
import { AccountService } from '../../../services/AccountService';
import { ERROR_NO_ACCOUNT } from '../../../util/messages';
import { createRandomToken } from '../../../util/tokens';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { get24HoursExpiryTimestamp } from '@thxnetwork/auth/util/time';

export const validation = [
    body('email').optional().isEmail(),
    body('return_url').optional(),
    body('firstName').optional().isString().isLength({ min: 0, max: 50 }),
    body('lastName').optional().isString().isLength({ min: 0, max: 50 }),
    body('organisation').optional().isString().isLength({ min: 0, max: 50 }),
    body().customSanitizer((val) => {
        return {
            firstName: val.firstName,
            lastName: val.lastName,
            organisation: val.organisation,
            email: val.email,
            return_url: val.return_url,
        };
    }),
];

export async function controller(req: Request, res: Response) {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);
    const file = (req.files as any)?.profile?.[0] as Express.Multer.File;
    const body = { ...req.body };

    if (!account) throw new Error(ERROR_NO_ACCOUNT);

    const isEmailChanged =
        (req.body.email && account.email && account.email.toLowerCase() != req.body.email.toLowerCase()) ||
        (req.body.email && !account.email);

    if (file) {
        const profileImg = await UploadProxy.post(file);
        body['profileImg'] = profileImg;
    }

    await AccountService.update(account, body);

    if (isEmailChanged) {
        account.isEmailVerified = false;
        account.setToken({
            kind: AccessTokenKind.VerifyEmail,
            accessToken: createRandomToken(),
            expiry: get24HoursExpiryTimestamp(),
        } as IAccessToken);
        await account.save();

        // SEND VERIFICATION REQUEST FOR THE NEW EMAIL
        await MailService.sendVerificationEmail(account, req.body.return_url);
    }

    res.redirect(`/oidc/${uid}/account`);
}

export default { validation, controller };
