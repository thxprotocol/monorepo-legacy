import { Request, Response } from 'express';
import { oidc } from '../../../util/oidc';
import { RewardConditionPlatform } from '@thxnetwork/types/index';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { GithubService } from '@thxnetwork/auth/services/GithubServices';
import { AccountService } from '@thxnetwork/auth/services/AccountService';

const isExpired = (expiry?: number) => {
    if (!expiry) return true;
    return Date.now() > expiry;
};

async function controller(req: Request, res: Response) {
    const { uid, params, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    let redirect = '';

    if (params.channel == RewardConditionPlatform.Google) {
        redirect = isExpired(account.googleAccessTokenExpires)
            ? YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getExpandedScopes())
            : params.redirect_uri;
    } else if (params.channel == RewardConditionPlatform.Twitter) {
        redirect = isExpired(account.twitterAccessTokenExpires)
            ? TwitterService.getLoginURL(uid, {})
            : params.redirect_uri;
    } else if (params.channel == RewardConditionPlatform.Github) {
        redirect = isExpired(account.githubAccessTokenExpires)
            ? GithubService.getLoginURL(uid, {})
            : params.redirect_uri;
    }

    if (!redirect) {
        await oidc.interactionResult(req, res, {}, { mergeWithLastSubmission: true });
        redirect = params.return_url;
    }

    res.redirect(redirect);
}

export default { controller };
