import { Request, Response } from 'express';
import { authenticator } from '@otplib/preset-default';
import { AccountService } from '../../../../services/AccountService';
import { ERROR_NO_ACCOUNT } from '../../../../util/messages';
import { body } from 'express-validator';

const validation: any[] = [body('code').exists(), body('otpSecret').exists()];

async function controller(req: Request, res: Response) {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);
    if (!account) throw new Error(ERROR_NO_ACCOUNT);

    if (req.body.code && req.body.otpSecret) {
        const isValid = authenticator.check(req.body.code, req.body.otpSecret);
        if (isValid) {
            await account.updateOne({ otpSecret: req.body.otpSecret });
            return res.redirect(`/oidc/${uid}/account`);
        }
    }

    if (req.body.disable) {
        await account.updateOne({ $unset: { otpSecret: '' } });
        return res.redirect(`/oidc/${uid}/account`);
    }

    res.redirect(`/oidc/${uid}/account/totp`);
}

export default { validation, controller };
