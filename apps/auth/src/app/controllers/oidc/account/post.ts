import { Request, Response } from 'express';
import { body } from 'express-validator';
import { MailService } from '../../../services/MailService';
import { hubspot } from '../../../util/hubspot';
import UploadProxy from '../../../proxies/UploadProxy';
import { AccountService } from '../../../services/AccountService';
import { ERROR_NO_ACCOUNT } from '../../../util/messages';
import { createRandomToken } from '../../../util/tokens';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { get24HoursExpiryTimestamp } from '@thxnetwork/auth/util/time';
import { Account, AccountDocument } from '@thxnetwork/auth/models/Account';
import { DASHBOARD_URL } from '@thxnetwork/auth/config/secrets';
import TokenService from '@thxnetwork/auth/services/TokenService';

export const validation = [
    body('email').exists().isEmail(),
    body('return_url').exists().isURL({ require_tld: false }),
    body('firstName').optional().isString().isLength({ min: 0, max: 50 }),
    body('lastName').optional().isString().isLength({ min: 0, max: 50 }),
    body('organisation').optional().isString().isLength({ min: 0, max: 50 }),
    body('website').optional().isURL({ require_tld: false }),
    body().customSanitizer((val) => {
        return {
            email: val.email,
            firstName: val.firstName,
            lastName: val.lastName,
            organisation: val.organisation,
            website: val.website,
            return_url: val.return_url,
        };
    }),
];

export async function controller(req: Request, res: Response) {
    const { uid, session } = req.interaction;
    let account: AccountDocument = await AccountService.get(session.accountId);
    if (!account) throw new Error(ERROR_NO_ACCOUNT);

    const file = (req.files as any)?.profile?.[0] as Express.Multer.File;
    const isEmailChanged = req.body.email
        ? account.email
            ? account.email.toLowerCase()
            : '' !== req.body.email
            ? req.body.email.toLowerCase()
            : ''
        : false;

    let profileImg = '';
    if (file) {
        profileImg = await UploadProxy.post(file);
    }

    account = await Account.findByIdAndUpdate(account._id, { ...req.body, profileImg }, { new: true });

    if (isEmailChanged && account.email) {
        account.isEmailVerified = false;

        await TokenService.setToken(account, {
            kind: AccessTokenKind.VerifyEmail,
            accessToken: createRandomToken(),
            expiry: get24HoursExpiryTimestamp(),
        });
        await account.save();
        await MailService.sendVerificationEmail(account, account.email, req.body.return_url);
    }

    if (req.body.return_url.startsWith(DASHBOARD_URL)) {
        hubspot.upsert({
            email: account.email,
            firstname: account.firstName,
            lastname: account.lastName,
            website: account.website,
            company: account.organisation,
            plan: account.plan,
        });
    }

    res.redirect(`/oidc/${uid}/account`);
}

export default { validation, controller };
