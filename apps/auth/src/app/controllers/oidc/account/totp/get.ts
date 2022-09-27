import { Request, Response } from 'express';
import qrcode from 'qrcode';
import { authenticator } from '@otplib/preset-default';
import { AccountService } from '../../../../services/AccountService';
import { ERROR_NO_ACCOUNT } from '../../../../util/messages';

const validation: any[] = [];

async function controller(req: Request, res: Response) {
    const { uid, session } = req.interaction;
    const account = await AccountService.get(session.accountId);
    if (!account) throw new Error(ERROR_NO_ACCOUNT);

    if (!account.otpSecret) {
        account.otpSecret = authenticator.generateSecret();
    }

    const otpauth = authenticator.keyuri(account.email, 'THX', account.otpSecret);
    const qrCode = await qrcode.toDataURL(otpauth);

    return res.render('totp', {
        uid,
        params: { otpSecret: account.otpSecret, qrCode },
    });
}

export default { validation, controller };
