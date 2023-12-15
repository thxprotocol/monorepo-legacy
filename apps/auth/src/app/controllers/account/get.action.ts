import { Request, Response } from 'express';
import { NotFoundError } from '../../util/errors';
import { AccountService } from '../../services/AccountService';
import { GithubService } from '../../services/GithubServices';
import { YouTubeService } from '@thxnetwork/auth/services/YouTubeService';
import { TwitterService } from '@thxnetwork/auth/services/TwitterService';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { logger } from '@thxnetwork/auth/util/logger';
import { IAccessToken } from '@thxnetwork/types/index';

async function formatAccountRes(account, accessIncluded = true) {
    const twitterToken = account.getToken(AccessTokenKind.Twitter);
    const twitterUsername = twitterToken ? twitterToken.metadata?.username : 'Unknown';
    const response = {
        username: account.username,
        sub: String(account._id),
        address: account.address,
        firstName: account.firstName,
        lastName: account.lastName,
        website: account.website,
        company: account.company,
        plan: account.plan,
        email: account.email,
        profileImg: account.profileImg,
        variant: account.variant,
        referralCode: account.referralCode,
        twitterUsername,
        role: account.role,
        goal: account.goal,
        connectedAccounts: account.tokens.map((token: IAccessToken) => ({
            id: token.userId,
            kind: token.kind,
            userId: token.userId,
            metadata: token.metadata,
        })),
    };
    if (accessIncluded) {
        const [
            googleAccess,
            youtubeViewAccess,
            youtubeManageAccess,
            twitterAccess,
            githubAccess,
            discordAccess,
            twitchAccess,
        ] = await Promise.all([
            await YouTubeService.isAuthorized(account, AccessTokenKind.Google),
            await YouTubeService.isAuthorized(account, AccessTokenKind.YoutubeView),
            await YouTubeService.isAuthorized(account, AccessTokenKind.YoutubeManage),
            await TwitterService.isAuthorized(account),
            await GithubService.isAuthorized(account),
            await DiscordService.isAuthorized(account),
            await TwitchService.isAuthorized(account),
        ]);

        Object.assign(response, {
            googleAccess,
            youtubeViewAccess,
            youtubeManageAccess,
            twitterAccess,
            githubAccess,
            discordAccess,
            twitchAccess,
        });
    }
    return response;
}

export const getMe = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.auth.sub);
    if (!account) throw new NotFoundError('Could not find the account for this sub');
    res.send(await formatAccountRes(account));
};

export const getAccount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    if (!account) throw new NotFoundError('Could not find the account for this sub');

    res.send(await formatAccountRes(account));
};

export const getAccountByAddress = async (req: Request, res: Response) => {
    const account = await AccountService.getByAddress(req.params.address);
    if (!account) throw new NotFoundError('Could not find the account for this address');

    res.send(await formatAccountRes(account));
};

export const getAccountByEmail = async (req: Request, res: Response) => {
    const account = await AccountService.getByEmail(req.params.email);
    if (!account) throw new NotFoundError('Could not find this account for this email');

    res.send(await formatAccountRes(account));
};

export const getAccountByDiscord = async (req: Request, res: Response) => {
    const account = await AccountService.getByDiscordId(req.params.discordId);
    if (!account) throw new NotFoundError('Could not find this account for this discord');

    res.send(await formatAccountRes(account));
};

export const getMultipleAccounts = async (req: Request, res: Response) => {
    const subs = String(req.query.subs)
        .split(',')
        .filter((sub: string) => !!sub);
    if (!subs.length) return [];

    const manyAccounts = await AccountService.getMany(subs);
    const accounts = await Promise.all(
        manyAccounts.map(async (account) => {
            try {
                return await formatAccountRes(account, false);
            } catch (error) {
                logger.error(error);
            }
        }),
    );

    res.send(accounts);
};
