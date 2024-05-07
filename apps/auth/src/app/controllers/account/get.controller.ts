import { Request, Response } from 'express';
import { NotFoundError } from '../../util/errors';
import { AccountService } from '../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { AccountDocument } from '@thxnetwork/auth/models/Account';
import TokenService from '@thxnetwork/auth/services/TokenService';

async function decorate(account: AccountDocument) {
    const sub = String(account._id);
    const kinds = [
        AccessTokenKind.Google,
        AccessTokenKind.Twitter,
        AccessTokenKind.Discord,
        AccessTokenKind.Twitch,
        AccessTokenKind.Github,
    ];
    const tokens = (await Promise.all(kinds.map((kind) => TokenService.getToken(account, kind))))
        .filter((token) => !!token)
        .map(({ kind, scopes, userId, metadata }) => ({ kind, scopes, userId, metadata }));
    const profileImg = account.profileImg || `https://api.dicebear.com/7.x/identicon/svg?seed=${sub}`;

    return {
        sub,
        profileImg,
        username: account.username,
        address: account.address,
        firstName: account.firstName,
        lastName: account.lastName,
        website: account.website,
        organisation: account.organisation,
        isEmailVerified: account.isEmailVerified,
        plan: account.plan,
        email: account.email,
        variant: account.variant,
        role: account.role,
        goal: account.goal,
        identity: account.identity,
        tokens,
    };
}

export const getMe = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.auth.sub);
    if (!account) throw new NotFoundError('Could not find the account for this sub');

    res.send(await decorate(account));
};

export const getAccount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    if (!account) throw new NotFoundError('Could not find the account for this sub');

    res.send(await decorate(account));
};

export const getAccountByAddress = async (req: Request, res: Response) => {
    const account = await AccountService.getByAddress(req.params.address);
    if (!account) return res.end();

    res.send(await decorate(account));
};

export const getAccountByEmail = async (req: Request, res: Response) => {
    const account = await AccountService.getByEmail(req.params.email);
    if (!account) return res.end();

    res.send(await decorate(account));
};

export const getAccountByIdentity = async (req: Request, res: Response) => {
    const account = await AccountService.getByIdentity(req.params.identity);
    if (!account) return res.end();

    res.send(await decorate(account));
};

export const getAccountByDiscord = async (req: Request, res: Response) => {
    const token = await TokenService.findTokenForUserId(req.params.discordId, AccessTokenKind.Discord);
    if (!token) return res.end();

    const account = await AccountService.get(token.sub);
    if (!account) return res.end();

    res.send(await decorate(account));
};
