import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { AccountPlanType, OAuthVariant, OAuthScope } from '@thxnetwork/types/enums';
import TokenService from '@thxnetwork/auth/services/TokenService';

async function controller(req: Request, res: Response) {
    const { uid, params, alert, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    params.githubLoginUrl = TokenService.getLoginURL({
        uid,
        variant: OAuthVariant.Github,
        scope: OAuthScope.GithubAuth,
    });
    params.googleLoginUrl = TokenService.getLoginURL({
        uid,
        variant: OAuthVariant.Google,
        scope: OAuthScope.GoogleAuth,
    });
    params.twitterLoginUrl = TokenService.getLoginURL({
        uid,
        variant: OAuthVariant.Twitter,
        scope: OAuthScope.TwitterAuth,
    });
    params.discordLoginUrl = TokenService.getLoginURL({
        uid,
        variant: OAuthVariant.Discord,
        scope: OAuthScope.DiscordAuth,
    });
    params.twitchLoginUrl = TokenService.getLoginURL({
        uid,
        variant: OAuthVariant.Twitch,
        scope: OAuthScope.TwitchAuth,
    });

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
            googleAccess: await TokenService.refreshToken(account, OAuthScope.GoogleAuth),
            youtubeViewAccess: await TokenService.refreshToken(account, OAuthScope.GoogleYoutubeLike),
            youtubeManageAccess: await TokenService.refreshToken(account, OAuthScope.GoogleYoutubeSubscribe),
            twitterAccess: await TokenService.refreshToken(account, OAuthScope.TwitterAuth),
            githubAccess: await TokenService.refreshToken(account, OAuthScope.GithubAuth),
            discordAccess: await TokenService.refreshToken(account, OAuthScope.DiscordAuth),
            twitchAccess: await TokenService.refreshToken(account, OAuthScope.TwitchAuth),
        },
    });
}

export default { controller };
