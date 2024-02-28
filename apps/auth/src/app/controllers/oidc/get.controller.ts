import { Request, Response } from 'express';
import { oidc } from '@thxnetwork/auth/util/oidc';
import { AccountVariant } from '@thxnetwork/common/enums';
import AuthService from '@thxnetwork/auth/services/AuthService';

async function controller(req: Request, res: Response) {
    const { uid, prompt, params } = await oidc.interactionDetails(req, res);

    // If params.auth_variant is available, deeplink to auth_variant
    if (params && params.auth_variant) {
        const variant = Number(params.auth_variant) as AccountVariant;
        const authVariantRedirectMap = {
            [AccountVariant.EmailPassword]: () =>
                AuthService.redirectOTP(req, res, { email: String(params.auth_email) }),
            [AccountVariant.Metamask]: () =>
                AuthService.redirectWalletConnect(req, res, {
                    message: params.auth_message as string,
                    signature: params.auth_signature as string,
                }),
            [AccountVariant.SSOGoogle]: () => AuthService.redirectSSO(req, res, { uid, variant }),
            [AccountVariant.SSODiscord]: () => AuthService.redirectSSO(req, res, { uid, variant }),
            [AccountVariant.SSOTwitter]: () => AuthService.redirectSSO(req, res, { uid, variant }),
            [AccountVariant.SSOTwitch]: () => AuthService.redirectSSO(req, res, { uid, variant }),
            [AccountVariant.SSOGithub]: () => AuthService.redirectSSO(req, res, { uid, variant }),
        };
        return authVariantRedirectMap[variant]();
    }

    // For other cases check the prompt or params.prompt values
    const redirectMap = {
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
