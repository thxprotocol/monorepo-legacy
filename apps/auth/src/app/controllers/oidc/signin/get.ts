import { GithubService } from './../../../services/GithubServices';
import { Request, Response } from 'express';
import { AUTH_URL, WALLET_URL } from '../../../config/secrets';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { AUTH_REQUEST_TYPED_MESSAGE, createTypedMessage } from '../../../util/typedMessage';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';
import BrandProxy from '@thxnetwork/auth/proxies/BrandProxy';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    const alert = {};
    let claim,
        brand,
        claimUrl = '';

    if (params.pool_id) {
        brand = await BrandProxy.get(params.pool_id);
    }

    if (params.pool_transfer_token) {
        alert['variant'] = 'success';
        alert[
            'message'
        ] = `<i class="fas fa-gift mr-2" aria-hidden="true"></i>Sign in to access your <strong>loyalty pool</strong>!`;
    }

    if (params.claim_id) {
        claim = await ClaimProxy.get(params.claim_id);
        claimUrl = `${WALLET_URL}/claim/${params.claim_id}`;
        brand = await BrandProxy.get(claim.pool._id);

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

    params.googleLoginUrl = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes());
    params.githubLoginUrl = GithubService.getLoginURL(uid, {});
    params.discordLoginUrl = DiscordService.getLoginURL(uid, {});
    params.twitchLoginUrl = TwitchService.getLoginURL(uid, {});
    params.twitterLoginUrl = TwitterService.getLoginURL(uid, {});
    params.authRequestMessage = createTypedMessage(AUTH_REQUEST_TYPED_MESSAGE, AUTH_URL, uid);

    res.render('signin', {
        uid,
        params: { ...params, ...brand, claim, claimUrl },
        alert,
    });
}

export default { controller };
