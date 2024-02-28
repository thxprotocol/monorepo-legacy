import { Request, Response } from 'express';
import { AUTH_URL, DASHBOARD_URL, WIDGET_URL } from '../../../config/secrets';
import { AccountVariant, AccessTokenKind, OAuthRequiredScopes } from '@thxnetwork/common/enums';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';
import PoolProxy from '@thxnetwork/auth/proxies/PoolProxy';
import TokenService from '@thxnetwork/auth/services/TokenService';
import EthereumService, { AUTH_REQUEST_TYPED_MESSAGE } from '@thxnetwork/auth/services/EthereumService';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    const alert = {};
    const isWidget = params.return_url ? params.return_url.startsWith(WIDGET_URL) : false;
    const isDashboard = params.return_url ? params.return_url.startsWith(DASHBOARD_URL) : false;
    const isSignup = ['1', '2'].includes(params.signup_plan);

    let pool,
        claim,
        brand,
        authenticationMethods = Object.values(AccountVariant);

    if (params.pool_id) {
        brand = await BrandProxy.get(params.pool_id);
        pool = await PoolProxy.getPool(params.pool_id);
        if (pool.settings && pool.settings.authenticationMethods) {
            authenticationMethods = pool.settings.authenticationMethods;
        }
    }

    if (pool && params.collaborator_request_token) {
        alert['variant'] = 'success';
        alert[
            'message'
        ] = `<i class="fas fa-info-circle mr-2" aria-hidden="true"></i> Accept invite for <strong>${pool.settings.title}</strong>!`;
    }

    if (params.pool_transfer_token) {
        alert['variant'] = 'success';
        alert['message'] = `<i class="fas fa-gift mr-2" aria-hidden="true"></i>Sign in to access your campaign!`;
    }

    if (params.claim_id) {
        claim = await ClaimProxy.get(params.claim_id);

        alert['variant'] = 'success';
        if (claim.erc20) {
            alert[
                'message'
            ] = `<i class="fas fa-gift mr-2" aria-hidden="true"></i>Sign in and claim your <strong>${claim.reward.amount} ${claim.erc20.symbol}!</strong>`;
        }
        if (claim.erc721) {
            alert[
                'message'
            ] = `<i class="fas fa-gift mr-2" aria-hidden="true"></i>Sign in and claim your <strong>${claim.erc721.symbol} NFT!</strong>`;
        }
    }

    params.emailPasswordEnabled = authenticationMethods.includes(AccountVariant.EmailPassword);
    params.metaMaskEnabled = authenticationMethods.includes(AccountVariant.Metamask);
    params.trustedProviderAvailable = authenticationMethods.some((method: AccountVariant) =>
        [
            AccountVariant.SSOGoogle,
            AccountVariant.SSOTwitter,
            AccountVariant.SSOTwitch,
            AccountVariant.SSOGithub,
            AccountVariant.SSODiscord,
        ].includes(method),
    );

    params.googleLoginUrl = authenticationMethods.includes(AccountVariant.SSOGoogle)
        ? TokenService.getLoginURL({
              kind: AccessTokenKind.Google,
              uid,
              scopes: OAuthRequiredScopes.GoogleAuth,
          })
        : null;
    params.githubLoginUrl = authenticationMethods.includes(AccountVariant.SSOGithub)
        ? TokenService.getLoginURL({ kind: AccessTokenKind.Github, uid, scopes: OAuthRequiredScopes.GithubAuth })
        : null;
    params.discordLoginUrl = authenticationMethods.includes(AccountVariant.SSODiscord)
        ? TokenService.getLoginURL({ kind: AccessTokenKind.Discord, uid, scopes: OAuthRequiredScopes.DiscordAuth })
        : null;
    params.twitchLoginUrl = authenticationMethods.includes(AccountVariant.SSOTwitch)
        ? TokenService.getLoginURL({ kind: AccessTokenKind.Twitch, uid, scopes: OAuthRequiredScopes.TwitchAuth })
        : null;
    params.twitterLoginUrl = authenticationMethods.includes(AccountVariant.SSOTwitter)
        ? TokenService.getLoginURL({ kind: AccessTokenKind.Twitter, uid, scopes: OAuthRequiredScopes.TwitterAuth })
        : null;
    params.authRequestMessage = EthereumService.createTypedMessage(AUTH_REQUEST_TYPED_MESSAGE, AUTH_URL, uid);

    res.render('signin', {
        uid,
        params: { ...params, ...brand, claim, isWidget, isDashboard, isSignup },
        alert,
    });
}

export default { controller };
