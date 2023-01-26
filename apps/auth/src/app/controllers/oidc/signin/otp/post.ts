import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { oidc } from '@thxnetwork/auth/util/oidc';
import { AccessTokenKind } from '@thxnetwork/types/index';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [
    body('otp').exists().isString().isLength({ min: 5, max: 5 }),
    body('returnUrl').exists().isURL({ require_tld: false }),
];

async function controller(req: Request, res: Response) {
    let claim, brand;
    const { uid, params } = req.interaction;

    if (params.claim_id) {
        claim = await ClaimProxy.get(params.claim_id);
        brand = await BrandProxy.get(claim.pool._id);
    }

    try {
        const account = await AccountService.get(params.sub);
        if (!account) throw new Error('No account could be found for this one-time password.');

        const isValid = await AccountService.isOTPValid(account, req.body.otp);
        if (!isValid) throw new Error('Your one-time password is incorrect.');

        const token = account.getToken(AccessTokenKind.Auth);
        if (token.expiry < Date.now()) throw new Error('One-time password expired');

        return await oidc.interactionFinished(req, res, { login: { accountId: String(account._id) } });
    } catch (error) {
        const alert = { variant: 'danger', icon: 'exclamation-circle', message: error.message };
        return res.render('otp', { uid, alert, params: { ...params, ...brand, claim } });
    }
}

export default { controller, validation };
