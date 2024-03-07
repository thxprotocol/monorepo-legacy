import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { oidc } from '@thxnetwork/auth/util/oidc';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import TokenService from '@thxnetwork/auth/services/TokenService';
import AuthService from '@thxnetwork/auth/services/AuthService';

const validation = [
    body('otp').exists().isString().isLength({ min: 5, max: 5 }),
    body('returnUrl').exists().isURL({ require_tld: false }),
];

async function controller(req: Request, res: Response) {
    let claim, brand;
    const { uid, params } = req.interaction;

    const attemptCount = await AuthService.getOTPAttempt(req);
    if (attemptCount >= 5) throw new Error('You have reached the maximum number of attempts.');

    if (params.claim_id) {
        claim = await ClaimProxy.get(params.claim_id);
        brand = await BrandProxy.get(claim.pool._id);
    }

    try {
        const account = await AccountService.get(params.sub);
        if (!account) throw new Error('No account could be found for this one-time password.');

        const isValid = await AuthService.isOTPValid(account, req.body.otp);
        if (!isValid) throw new Error('Your one-time password is incorrect.');

        const token = await TokenService.getToken(account, AccessTokenKind.Auth);
        if (token.expiry < Date.now()) throw new Error('One-time password expired');

        await account.updateOne({ isEmailVerified: true });

        await AuthService.getReturnUrl(account, req.interaction);

        return await oidc.interactionFinished(req, res, { login: { accountId: String(account._id) } });
    } catch (error) {
        return res.render('otp', {
            uid,
            alert: { variant: 'danger', icon: 'exclamation-circle', message: error.message },
            params: { ...params, ...brand, claim },
        });
    }
}

export default { controller, validation };
