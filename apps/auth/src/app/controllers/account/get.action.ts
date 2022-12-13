import { Request, Response } from 'express';
import { NotFoundError } from '../../util/errors';
import { AccountService } from '../../services/AccountService';
import { YouTubeService } from '@thxnetwork/auth/services/YouTubeService';

async function formatAccountRes(account) {
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
            googleAccess:
                account.googleAccessToken !== undefined &&
                account.googleAccessTokenExpires > Date.now() &&
                (await YouTubeService.haveExpandedScopes(account.googleAccessToken)),
            twitterAccess: account.twitterAccessToken !== undefined && account.twitterAccessTokenExpires > Date.now(),
            twitchAccess: account.twitchAccessToken !== undefined && account.twitchAccessTokenExpires > Date.now(),
        },
        ...protectedPrivateKey,
    };
}

export const getAccount = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.id);
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
