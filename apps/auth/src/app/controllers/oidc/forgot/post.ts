import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { MailService } from '../../../services/MailService';

async function controller(req: Request, res: Response) {
    const account = await AccountService.getByEmail(req.body.email);

    // This leaks email adresses which are registered, consider failing silently..
    if (!account) {
        return res.render('forgot', {
            uid: req.params.uid,
            params: {
                return_url: req.body.returnUrl,
            },
            alert: { variant: 'danger', message: 'An account with this e-mail address not exists.' },
        });
    }

    await MailService.sendResetPasswordEmail(account, req.body.returnUrl);

    return res.render('forgot', {
        uid: req.params.uid,
        params: {
            return_url: req.body.returnUrl,
        },
        alert: {
            variant: 'success',
            message: 'We have send a password reset link to ' + account.email + '. It will be valid for 20 minutes.',
        },
    });
}

export default { controller };
