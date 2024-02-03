import { Request, Response } from 'express';
import { oidc } from '../../../util/oidc';
import TokenService from '../../../services/TokenService';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    const redirectURL = params.oauth_variant
        ? TokenService.getLoginURL({ variant: params.oauth_variant, uid, scope: params.oauth_scope })
        : params.return_url;

    if (!params.oauth_variant) {
        await oidc.interactionResult(req, res, {}, { mergeWithLastSubmission: true });
    }

    res.redirect(redirectURL);
}

export default { controller };
