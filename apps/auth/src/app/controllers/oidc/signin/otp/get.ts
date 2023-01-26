import { Request, Response } from 'express';
import { track } from '@thxnetwork/auth/util/mixpanel';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    let claim, brand;

    if (params.claim_id) {
        claim = await ClaimProxy.get(params.claim_id);
        brand = await BrandProxy.get(claim.pool._id);
    }

    track.UserVisits(params.distinct_id, `oidc sign in otp`, [uid, params.return_url]);

    const alert = {
        variant: 'info',
        icon: 'question-circle',
        message: 'We have sent you a one-time password.',
    };

    res.render('otp', { uid, alert, params: { ...params, ...brand, claim } });
}

export default { controller };
