import { oidc } from '../../../util/oidc';
import { AccountService } from '../../../services/AccountService';
import { MailService } from '../../../services/MailService';
import { Request, Response } from 'express';
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util';
import { body } from 'express-validator';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { AccountPlanType } from '@thxnetwork/types/enums';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';

const validation = [body('email').exists().isEmail()];

async function controller(req: Request, res: Response) {
    function renderSigninPage(variant: string, errorMessage: string) {
        return res.render('signin', {
            uid: req.params.uid,
            params: { return_url: req.body.returnUrl },
            alert: {
                variant,
                message: errorMessage,
            },
        });
    }

    // If signed auth request is available recover the address from the signature and lookup user
    if (req.body.authRequestMessage && req.body.authRequestSignature) {
        const address = recoverTypedSignature({
            data: JSON.parse(req.body.authRequestMessage),
            signature: req.body.authRequestSignature,
            version: 'V3' as SignTypedDataVersion,
        });
        if (!address) throw new UnauthorizedError('Could not recover address from signed message.');

        const account = await AccountService.signinWithAddress(address);
        if (!account) throw new UnauthorizedError('Could not find an account for this address.');

        return await oidc.interactionFinished(req, res, { login: { accountId: String(account._id) } });
    } else if (req.body.email) {
        try {
            const email = req.body.email.toLowerCase();
            const plan = req.body.plan ? Number(req.body.plan) : AccountPlanType.Free;
            let account: AccountDocument = await AccountService.getByEmail(email);

            if (!account) {
                account = await AccountService.signup({
                    email,
                    variant: AccountVariant.EmailPassword,
                    active: false,
                    plan,
                });
            }

            await MailService.sendOTPMail(account);

            // Store the sub in the interaction so we can lookup the hashed OTP later
            req.interaction.params.sub = String(account._id);
            req.interaction.params.email = email;
            req.interaction.params.plan = plan;

            await req.interaction.save(Date.now() + 10 * 60 * 1000); // ttl 10min

            return res.redirect(`/oidc/${req.params.uid}/signin/otp`);
        } catch (error) {
            return renderSigninPage('danger', error.message);
        }
    }
}

export default { controller, validation };
