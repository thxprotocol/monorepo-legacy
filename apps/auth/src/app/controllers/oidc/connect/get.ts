import { Request, Response } from 'express';
import { oidc } from '../../../util/oidc';
import { RewardConditionPlatform } from '@thxnetwork/types/index';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { GithubService } from '@thxnetwork/auth/services/GithubServices';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    let redirect = '';

    if (params.channel == RewardConditionPlatform.Google) {
        redirect = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getExpandedScopes());
    } else if (params.channel == RewardConditionPlatform.Twitter) {
        redirect = TwitterService.getLoginURL(uid, {});
    } else if (params.channel == RewardConditionPlatform.Github) {
        redirect = GithubService.getLoginURL(uid, {});
    }

    if (!redirect) {
        await oidc.interactionResult(req, res, {}, { mergeWithLastSubmission: true });
        redirect = params.return_url;
    }

    return res.redirect(redirect);
}

export default { controller };
