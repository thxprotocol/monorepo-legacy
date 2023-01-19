import { Request, Response } from 'express';
import { NotFoundError } from '../../util/errors';
import { AccountService } from '../../services/AccountService';
import { GithubService } from '../../services/GithubServices';
import { YouTubeService } from '@thxnetwork/auth/services/YouTubeService';
import { TwitterService } from '@thxnetwork/auth/services/TwitterService';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';

async function formatAccountRes(account) {
    return {
        sub: String(account._id),
        address: account.address,
        firstName: account.firstName,
        lastName: account.lastName,
        company: account.company,
        plan: account.plan,
        email: account.email,
        googleAccess: await YouTubeService.isAuthorized(account, AccessTokenKind.Google),
        youtubeViewAccess: await YouTubeService.isAuthorized(account, AccessTokenKind.YoutubeView),
        youtubeManageAccess: await YouTubeService.isAuthorized(account, AccessTokenKind.YoutubeManage),
        twitterAccess: await TwitterService.isAuthorized(account),
        githubAccess: await GithubService.isAuthorized(account),
        discordAccess: await DiscordService.isAuthorized(account),
        twitchAccess: await TwitchService.isAuthorized(account),
    };
}

export const getAccount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    if (!account) {
        throw new NotFoundError();
    }
    res.send(await formatAccountRes(account));
};

export const getAccountByAddress = async (req: Request, res: Response) => {
    const account = await AccountService.getByAddress(req.params.address);
    if (!account) {
        throw new NotFoundError();
    }
    res.send(await formatAccountRes(account));
};

export const getAccountByEmail = async (req: Request, res: Response) => {
    const account = await AccountService.getByEmail(req.params.email);

    if (!account) {
        throw new NotFoundError();
    }

    res.send(await formatAccountRes(account));
};
