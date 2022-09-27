import { Request, Response } from 'express';
import { oidc } from '../../util/oidc';

async function controller(req: Request, res: Response) {
    const interaction = await oidc.interactionDetails(req, res);
    const { uid, prompt, params } = interaction;

    // Prompt params are used for unauthenticated routes
    switch (params.prompt) {
        case 'create': {
            return res.redirect(`/oidc/${uid}/signup?returnUrl=${params.return_url}`);
        }
        case 'confirm': {
            return res.redirect(`/oidc/${uid}/confirm`);
        }
        case 'reset': {
            return res.redirect(`/oidc/${uid}/reset`);
        }
        case 'account-settings': {
            return res.redirect(`/oidc/${uid}/account`);
        }
    }

    // Regular prompts are used for authenticated routes
    switch (prompt.name) {
        case 'connect': {
            return res.redirect(`/oidc/${uid}/connect`);
        }
        case 'login': {
            if (params.reward_hash || params.claim_id) {
                return res.redirect(`/oidc/${uid}/claim`);
            } else {
                return res.redirect(`/oidc/${uid}/signin`);
            }
        }
    }
}

export default { controller };
