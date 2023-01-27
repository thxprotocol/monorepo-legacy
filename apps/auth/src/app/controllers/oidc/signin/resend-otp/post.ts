import { AccountService } from '../../../../services/AccountService';
import { MailService } from '../../../../services/MailService';
import { Request, Response } from 'express';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { NotFoundError } from '@thxnetwork/auth/util/errors';

async function controller(req: Request, res: Response) {
    const { params } = req.interaction;

    function renderSigninPage(variant: string, message: string) {
        return res.render('signin', {
            uid: req.params.uid,
            params: { return_url: params.return_url },
            alert: { variant, message },
        });
    }

    try {
        const account: AccountDocument = await AccountService.get(params.sub);
        if (!account) throw new NotFoundError();

        await MailService.sendOTPMail(account);

        return res.redirect(`/oidc/${req.params.uid}/signin/otp`);
    } catch (error) {
        return renderSigninPage('danger', error.message);
    }
}

export default { controller };
