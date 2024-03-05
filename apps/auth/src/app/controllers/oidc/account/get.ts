import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { AccessTokenKind, AccountPlanType, OAuthRequiredScopes } from '@thxnetwork/common/enums';
import TokenService from '@thxnetwork/auth/services/TokenService';

async function controller(req: Request, res: Response) {
    const { uid, params, alert, session } = req.interaction;
    const account = await AccountService.get(session.accountId);

    const kinds = [
        { kind: AccessTokenKind.Google, scopes: OAuthRequiredScopes.GoogleAuth },
        { kind: AccessTokenKind.Twitter, scopes: OAuthRequiredScopes.TwitterAuth },
        { kind: AccessTokenKind.Discord, scopes: OAuthRequiredScopes.DiscordAuth },
        { kind: AccessTokenKind.Twitch, scopes: OAuthRequiredScopes.TwitchAuth },
        { kind: AccessTokenKind.Github, scopes: OAuthRequiredScopes.GithubAuth },
    ];
    const [googleLoginUrl, twitterLoginUrl, discordLoginUrl, twitchLoginUrl, githubLoginUrl] = await Promise.all(
        kinds.map(async ({ kind, scopes }) => {
            const token = await TokenService.getToken(account, kind);
            if (token) return;
            return TokenService.getLoginURL({ kind, uid, scopes });
        }),
    );

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
            googleLoginUrl,
            twitterLoginUrl,
            discordLoginUrl,
            twitchLoginUrl,
            githubLoginUrl,
        },
    });
}

export default { controller };
