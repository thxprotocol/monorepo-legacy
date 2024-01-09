import { GithubService } from './../../../services/GithubServices';
import { Request, Response } from 'express';
import { AUTH_URL, DASHBOARD_URL, WIDGET_URL } from '../../../config/secrets';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { AUTH_REQUEST_TYPED_MESSAGE, createTypedMessage } from '../../../util/typedMessage';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';
import PoolProxy from '@thxnetwork/auth/proxies/PoolProxy';
import WalletProxy from '@thxnetwork/auth/proxies/WalletProxy';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import TelegramService from '@thxnetwork/auth/services/TelegramService';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    const alert = {};
    const isWidget = params.return_url ? params.return_url.startsWith(WIDGET_URL) : false;
    const isDashboard = params.return_url ? params.return_url.startsWith(DASHBOARD_URL) : false;
    const isSignup = ['1', '2'].includes(params.signup_plan);

    let pool,
        claim,
        brand,
        shopifyStoreUrl,
        authenticationMethods = Object.values(AccountVariant);

    if (params.pool_id) {
        brand = await BrandProxy.get(params.pool_id);
        pool = await PoolProxy.getPool(params.pool_id);
        if (pool.settings && pool.settings.authenticationMethods) {
            authenticationMethods = pool.settings.authenticationMethods;
        }
    }

    if (isDashboard) {
        authenticationMethods = [
            AccountVariant.EmailPassword,
            AccountVariant.SSOGoogle,
            AccountVariant.SSOTwitter,
            AccountVariant.SSODiscord,
            AccountVariant.SSOTwitch,
            AccountVariant.SSOGithub,
            AccountVariant.SSOTelegram,
        ];
    }

    if (pool && params.collaborator_request_token) {
        alert['variant'] = 'success';
        alert[
            'message'
        ] = `<i class="fas fa-info-circle mr-2" aria-hidden="true"></i> Accept invite for <strong>${pool.settings.title}</strong>!`;
    }

    if (params.wallet_transfer_token) {
        const { pointBalance } = await WalletProxy.getWalletTransfer(params.wallet_transfer_token);
        alert['variant'] = 'success';
        alert[
            'message'
        ] = `<i class="fas fa-gift mr-2" aria-hidden="true"></i>Sign in to claim <strong>${pointBalance}</strong> points!`;
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
    params.telegramLoginUrl = authenticationMethods.includes(AccountVariant.SSOTelegram)
        ? TelegramService.getLoginURL(req.params.uid)
        : null;
    params.googleLoginUrl = authenticationMethods.includes(AccountVariant.SSOGoogle)
        ? YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes())
        : null;
    params.githubLoginUrl = authenticationMethods.includes(AccountVariant.SSOGithub)
        ? GithubService.getLoginURL(uid, {})
        : null;
    params.discordLoginUrl = authenticationMethods.includes(AccountVariant.SSODiscord)
        ? DiscordService.getLoginURL(uid, {})
        : null;
    params.twitchLoginUrl = authenticationMethods.includes(AccountVariant.SSOTwitch)
        ? TwitchService.getLoginURL(uid, {})
        : null;
    params.twitterLoginUrl = authenticationMethods.includes(AccountVariant.SSOTwitter)
        ? TwitterService.getLoginURL(uid, {})
        : null;
    params.authRequestMessage = createTypedMessage(AUTH_REQUEST_TYPED_MESSAGE, AUTH_URL, uid);

    res.render('signin', {
        uid,
        params: { ...params, ...brand, claim, isWidget, isDashboard, isSignup, shopifyStoreUrl },
        alert,
    });
}

export default { controller };
