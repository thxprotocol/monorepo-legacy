import { Request, Response } from 'express';
import { NotFoundError } from '../../util/errors';
import { AccountService } from '../../services/AccountService';
import { AccessTokenKind } from '@thxnetwork/common/lib/types/enums';
import TokenService from '@thxnetwork/auth/services/TokenService';

export async function formatAccountRes(account) {
    const sub = String(account._id);
    const tokens = await TokenService.list(account);
    const profileImg = account.profileImg || `https://api.dicebear.com/7.x/identicon/svg?seed=${sub}`;
    return {
        sub,
        profileImg,
        username: account.username,
        address: account.address,
        firstName: account.firstName,
        lastName: account.lastName,
        website: account.website,
        company: account.company,
        plan: account.plan,
        email: account.email,
        variant: account.variant,
        referralCode: account.referralCode,
        role: account.role,
        goal: account.goal,
        tokens,
    };
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
    if (!account) return res.end();

    res.send(await formatAccountRes(account));
};

export const getAccountByEmail = async (req: Request, res: Response) => {
    const account = await AccountService.getByEmail(req.params.email);
    if (!account) return res.end();

    res.send(await formatAccountRes(account));
};

export const getAccountByDiscord = async (req: Request, res: Response) => {
    const token = await TokenService.findTokenForUserId(req.params.discordId, AccessTokenKind.Discord);
    if (!token) return res.end();

    const account = await AccountService.get(token.sub);
    if (!account) return res.end();

    res.send(await formatAccountRes(account));
};
