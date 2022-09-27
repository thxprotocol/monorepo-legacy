import { Request, Response } from 'express';
import { NotFoundError } from '../../util/errors';
import { AccountService } from '../../services/AccountService';

function formatAccountRes(account: any) {
    let protectedPrivateKey;
    if (account.privateKey) {
        protectedPrivateKey = { privateKey: account.privateKey };
    }
    return {
        ...{
            id: account._id,
            address: account.address,
            firstName: account.firstName,
            lastName: account.lastName,
            company: account.company,
            plan: account.plan,
            email: account.email,
            googleAccess: account.googleAccessToken && account.googleAccessTokenExpires > Date.now(),
            twitterAccess: account.twitterAccessToken && account.twitterAccessTokenExpires > Date.now(),
            spotifyAccess: account.spotifyAccessToken && account.spotifyAccessTokenExpires > Date.now(),
        },
        ...protectedPrivateKey,
    };
}

export const getAccount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.id);
    if (!account) {
        throw new NotFoundError();
    }

    res.send(formatAccountRes(account));
};

export const getAccountByAddress = async (req: Request, res: Response) => {
    const account = await AccountService.getByAddress(req.params.address);
    if (!account) {
        throw new NotFoundError();
    }
    res.send(formatAccountRes(account));
};

export const getAccountByEmail = async (req: Request, res: Response) => {
    const account = await AccountService.getByEmail(req.params.email);

    if (!account) {
        throw new NotFoundError();
    }

    res.send(formatAccountRes(account));
};
