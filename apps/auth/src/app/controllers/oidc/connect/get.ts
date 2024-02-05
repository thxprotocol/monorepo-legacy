import { Request, Response } from 'express';
import { oidc } from '../../../util/oidc';
import TokenService from '../../../services/TokenService';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;

    // If no provider scopes are requested redirect to the return url directly
    // as there is nothing to connect
    if (!params.provider_scope) {
        await oidc.interactionResult(req, res, {}, { mergeWithLastSubmission: true });
        return res.redirect(params.return_url);
    }

    const scopes = params.provider_scope.split(' ');
    const loginURL = TokenService.getLoginURL({ uid, kind: params.access_token_kind, scopes });

    res.redirect(loginURL);
}

export default { controller };
