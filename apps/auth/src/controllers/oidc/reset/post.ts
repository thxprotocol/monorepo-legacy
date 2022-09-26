import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';

async function controller(req: Request, res: Response) {
    const result = {
        uid: req.params.uid,
        params: {
            return_url: req.body.returnUrl,
            password_reset_token: req.body.passwordResetToken,
        },
        alert: {
            variant: 'success',
            message: '',
        },
    };

    try {
        await AccountService.getSubForPasswordResetToken(
            req.body.password,
            req.body.passwordConfirm,
            req.body.passwordResetToken,
        );
    } catch (error) {
        result.alert.variant = 'danger';
        result.alert.message = error.toString();
    }

    return res.render('reset', result);
}

export default { controller };
