import { Request, Response } from 'express';
import { oidc } from '../../../util/oidc';
import { RewardConditionPlatform } from '@thxnetwork/types/index';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { GithubService } from '@thxnetwork/auth/services/GithubServices';
import { AccountService } from '@thxnetwork/auth/services/AccountService';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';

/* 
This controller is used for connecting OAuth2 supporting platforms to a user account
Then tokens are not available, expired or dont have the proper scopes we redirect
users to the platform to authorize themselves. If all that is the case we redirect
them to the redirect_uri for the requesting client application. 
*/
async function controller(req: Request, res: Response) {
    const { uid, params, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    let redirect = '';
    switch (params.channel) {
        case RewardConditionPlatform.Google: {
            redirect = (await YouTubeService.isAuthorized(account))
                ? params.redirect_uri
                : YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getYoutubeScopes());
            break;
        }
        case RewardConditionPlatform.Twitter: {
            redirect = TwitterService.isAuthorized(account) ? params.redirect_uri : TwitterService.getLoginURL(uid, {});
            break;
        }
        case RewardConditionPlatform.Github: {
            redirect = GithubService.isAuthorized(account) ? params.redirect_uri : GithubService.getLoginURL(uid, {});
            break;
        }
        case RewardConditionPlatform.Twitch: {
            redirect = TwitchService.isAuthorized(account) ? params.redirect_uri : GithubService.getLoginURL(uid, {});
            break;
        }
        case RewardConditionPlatform.Discord: {
            redirect = DiscordService.isAuthorized(account) ? params.redirect_uri : GithubService.getLoginURL(uid, {});
            break;
        }
    }

    if (!redirect) {
        await oidc.interactionResult(req, res, {}, { mergeWithLastSubmission: true });
        redirect = params.return_url;
    }

    res.redirect(redirect);
}

export default { controller };
