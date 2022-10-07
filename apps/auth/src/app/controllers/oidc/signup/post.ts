import { Request, Response } from 'express';
import { AccountVariant } from '../../../types/enums/AccountVariant';
import { AccountService } from '../../../services/AccountService';
import { MailService } from '../../../services/MailService';
import { checkPasswordStrength } from '../../../util/passwordcheck';

async function controller(req: Request, res: Response) {
    function renderError(message: string) {
        return res.render('signup', {
            uid: req.params.uid,
            params: {
                return_url: req.body.returnUrl,
                signup_email: req.body.email,
            },
            alert: { variant: 'danger', message },
        });
    }

    const isDuplicate = await AccountService.isActiveUserByEmail(req.body.email);
    const passwordStrength = checkPasswordStrength(req.body.password);

    if (isDuplicate) {
        return renderError('An account with this e-mail address already exists.');
    } else if (passwordStrength != 'strong') {
        return renderError('Please enter a strong password.');
    } else if (req.body.password !== req.body.confirmPassword) {
        return renderError('The provided passwords are not identical.');
    } else if (req.body.acceptTermsPrivacy !== 'true') {
        return renderError('Please accept the terms of use and privacy statement.');
    } else if (!req.body.email?.length) {
        return renderError('Email cannot be blank.');
    }

    const signupData = {
        email: req.body.email,
        password: req.body.password,
        variant: AccountVariant.EmailPassword,
        acceptTermsPrivacy: req.body.acceptTermsPrivacy,
        acceptUpdates: req.body.acceptUpdates,
        active: false,
    };
    const account = await AccountService.signup(signupData);

    if (account.email) {
        await MailService.sendConfirmationEmail(account, req.body.returnUrl);
    }

    res.render('signup', {
        uid: req.params.uid,
        params: {
            return_url: req.body.returnUrl,
            signup_email: req.body.email,
        },
        alert: {
            variant: 'success',
            message: 'Verify your e-mail address by clicking the link we just sent you. You can close this window.',
        },
    });
}

export default { controller };
