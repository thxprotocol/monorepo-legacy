import { Request, Response } from 'express';
import { SpotifyService } from '../../../services/SpotifyService';
import { AccountService } from '../../../services/AccountService';

export const getSpotifyUserFollow = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    if (!account) throw new Error('Account not found');

    const result = await SpotifyService.validateUserFollow(account.spotifyAccessToken, [req.params.item]);

    res.json({ result });
};

export const getSpotifyPlaylistFollow = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    if (!account) throw new Error('Account not found');

    const user = await SpotifyService.getUser(account.spotifyAccessToken);
    if (!user) throw new Error('User not found');

    const result = await SpotifyService.validatePlaylistFollow(account.spotifyAccessToken, req.params.item, [user.id]);

    res.json({ result });
};
