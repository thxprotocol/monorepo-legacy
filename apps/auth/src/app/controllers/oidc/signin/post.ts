import { AccountService } from '../../../services/AccountService';
import { MailService } from '../../../services/MailService';
import { Request, Response } from 'express';
import { ERROR_ACCOUNT_NOT_ACTIVE, ERROR_AUTH_LINK, ERROR_OTP_CODE_INVALID } from '../../../util/messages';
import { oidc } from '../../../util/oidc';
import { authenticator } from '@otplib/preset-default';
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util';

async function controller(req: Request, res: Response) {
    function renderLogin(errorMessage: string) {
        return res.render('signin', {
            uid: req.params.uid,
            params: { return_url: req.body.returnUrl },
            alert: {
                variant: 'danger',
                message: errorMessage,
            },
        });
    }

    let account;
    // If signed auth request is available recover the address from the signature and lookup user
    if (req.body.authRequestMessage && req.body.authRequestSignature) {
        const recoveredAddress = recoverTypedSignature({
            data: JSON.parse(req.body.authRequestMessage),
            signature: req.body.authRequestSignature,
            version: 'V3' as SignTypedDataVersion,
        });
        account = await AccountService.signinWithAddress(recoveredAddress);
    }
    // if email and password are available lookup user by these credentials
    else if (req.body.email && req.body.password) {
        try {
            account = await AccountService.signinWithEmailPassword(req.body.email, req.body.password);
        } catch (error) {
            return renderLogin(String(error));
        }
    }
    // For all other instances throw an error
    else {
        throw new Error('Could not find signature or credential information in the request body.');
    }

    // Make sure to send a new confirmation email for inactive accounts
    if (!account.active) {
        await MailService.sendConfirmationEmail(account, req.body.returnUrl);
        return renderLogin(ERROR_ACCOUNT_NOT_ACTIVE);
    }

    // Serve MFA views
    if (account.otpSecret) {
        // Show signin with code field for this account
        if (!req.body.code) {
            return res.render('signin', {
                uid: req.params.uid,
                params: { return_url: req.body.returnUrl, ...req.body, mfaEnabled: true },
            });
        }
        // Show signin with code field for this account
        const isValid = authenticator.check(req.body.code, account.otpSecret);
        if (!isValid) {
            return res.render('signin', {
                uid: req.params.uid,
                params: { ...req.body, return_url: req.body.returnUrl, mfaEnabled: true },
                alert: {
                    variant: 'danger',
                    message: ERROR_OTP_CODE_INVALID,
                },
            });
        }
    }

    // Make sure to ask for a login link from the authority if custodial key is found
    if (account.privateKey) {
        return renderLogin(ERROR_AUTH_LINK);
    }

    // Actions after successfully login
    await AccountService.update(account, {
        lastLoginAt: Date.now(),
    });

    // Make to finish the interaction and login with sub
    return await oidc.interactionFinished(
        req,
        res,
        { login: { accountId: String(account._id) } },
        { mergeWithLastSubmission: false },
    );
}

export default { controller };
