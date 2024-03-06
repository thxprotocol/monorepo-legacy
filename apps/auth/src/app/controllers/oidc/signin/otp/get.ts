import { Request, Response } from 'express';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';

async function controller(req: Request, res: Response) {
    const { jti, params } = req.interaction;
    let claim, brand;

    if (params.claim_id) {
        claim = await ClaimProxy.get(params.claim_id);
        brand = await BrandProxy.get(claim.pool._id);
    }

    if (params.pool_id) {
        brand = await BrandProxy.get(params.pool_id);
    }

    const alert = {
        variant: 'info',
        icon: 'question-circle',
        message: `We sent a password to <strong>${params.email}</strong>`,
    };

    res.render('otp', { uid: jti, alert, email: req.interaction.email, params: { ...params, ...brand, claim } });
}

export default { controller };
