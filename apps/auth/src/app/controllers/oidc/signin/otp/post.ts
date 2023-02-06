import { DASHBOARD_URL } from '@thxnetwork/auth/config/secrets';
import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { hubspot } from '@thxnetwork/auth/util/hubspot';
import { oidc } from '@thxnetwork/auth/util/oidc';
import { createWallet } from '@thxnetwork/auth/util/wallet';
import { AccessTokenKind } from '@thxnetwork/types/index';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [
    body('otp').exists().isString().isLength({ min: 5, max: 5 }),
    body('returnUrl').exists().isURL({ require_tld: false }),
];

async function controller(req: Request, res: Response) {
    let claim, brand;
    const { uid, params, prompt, returnTo } = req.interaction;

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

        await account.updateOne({
            isEmailVerified: true,
            active: true,
        });

        const returnUrl = prompt.name === 'connect' ? params.return_url : returnTo;
        if (returnUrl.startsWith(DASHBOARD_URL)) {
            hubspot.upsert({ email: account.email });
        }

        // Create a wallet if wallet can not be found for user
        createWallet(account);

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
