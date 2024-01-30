import { Request, Response } from 'express';
import { DiscordService } from '../../../services/DiscordService';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { AccountService } from '../../../services/AccountService';
import { GithubService } from '../../../services/GithubServices';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import { AccountPlanType, AccessTokenKind } from '@thxnetwork/types/enums';

async function controller(req: Request, res: Response) {
    const { uid, params, alert, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    params.githubLoginUrl = GithubService.getLoginURL(uid, {});
    params.googleLoginUrl = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes());
    params.twitterLoginUrl = TwitterService.getLoginURL(uid, {});
    params.discordLoginUrl = DiscordService.getLoginURL(uid, {});
    params.twitchLoginUrl = TwitchService.getLoginURL(uid, {});

    return res.render('account', {
        uid,
        alert,
        params: {
            ...params,
            email: account.email,
            isEmailVerified: account.isEmailVerified,
            firstName: account.firstName,
            lastName: account.lastName,
            profileImg: account.profileImg,
            organisation: account.organisation,
            website: account.website,
            address: account.address,
            plan: account.plan,
            planType: AccountPlanType[account.plan],
            variant: account.variant,
            googleAccess: await YouTubeService.isAuthorized(account, AccessTokenKind.Google),
            youtubeViewAccess: await YouTubeService.isAuthorized(account, AccessTokenKind.YoutubeView),
            youtubeManageAccess: await YouTubeService.isAuthorized(account, AccessTokenKind.YoutubeManage),
            twitterAccess: await TwitterService.isAuthorized(account),
            githubAccess: await GithubService.isAuthorized(account),
            discordAccess: await DiscordService.isAuthorized(account),
            twitchAccess: await TwitchService.isAuthorized(account),
        },
    });
}

export default { controller };
