import { Request, Response } from 'express';
import { oidc } from '@thxnetwork/auth/util/oidc';

async function controller(req: Request, res: Response) {
    const { uid, prompt, params } = await oidc.interactionDetails(req, res);
    const redirectMap: any = {
        'verify_email': `/oidc/${uid}/account/email/verify`,
        'account-settings': `/oidc/${uid}/account`,
        'connect': `/oidc/${uid}/connect`,
        'login': `/oidc/${uid}/signin`,
    };
    const paramsPrompt = params.prompt as string;
    const url = redirectMap[paramsPrompt] ? redirectMap[paramsPrompt] : redirectMap[prompt.name];

    res.redirect(url);
}

export default { controller };
