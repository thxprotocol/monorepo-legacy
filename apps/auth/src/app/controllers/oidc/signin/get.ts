import { GithubService } from './../../../services/GithubServices';
import { Request, Response } from 'express';
import { AUTH_URL, WALLET_URL } from '../../../config/secrets';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { AUTH_REQUEST_TYPED_MESSAGE, createTypedMessage } from '../../../util/typedMessage';
import ClaimProxy from '@thxnetwork/auth/proxies/ClaimProxy';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    let claim,
        alert = {};

    if (params.claim_id) {
        claim = await ClaimProxy.get(params.claim_id);
        alert = {
            variant: 'success',
            message: 'Claim ' + claim.reward.amount + '!',
        };
    }

    params.googleLoginUrl = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes());
    params.githubLoginUrl = GithubService.getLoginURL(uid, {});

    if (params.return_url === WALLET_URL) {
        params.twitterLoginUrl = TwitterService.getLoginURL(uid, {});
        params.authRequestMessage = createTypedMessage(AUTH_REQUEST_TYPED_MESSAGE, AUTH_URL, uid);
    }

    res.render('signin', {
        uid,
        params: { ...params, claim },
        alert,
    });
}

export default { controller };
