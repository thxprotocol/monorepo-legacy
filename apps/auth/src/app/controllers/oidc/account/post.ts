import { Request, Response } from 'express';
import { body } from 'express-validator';
import { MailService } from '../../../services/MailService';

import UploadProxy from '../../../proxies/UploadProxy';
import { AccountService } from '../../../services/AccountService';
import { DURATION_TWENTYFOUR_HOURS, ERROR_NO_ACCOUNT } from '../../../util/messages';
import { createRandomToken } from '../../../util/tokens';

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
        account.verifyEmailToken = createRandomToken();
        account.verifyEmailTokenExpires = DURATION_TWENTYFOUR_HOURS;
        await account.save();

        // SEND VERIFICATION REQUEST FOR THE NEW EMAIL
        await MailService.sendVerificationEmail(account, req.body.return_url);
    }

    res.redirect(`/oidc/${uid}/account`);
}

export default { validation, controller };
