import { Request, Response } from 'express';
import { AccountDocument } from '../../../models/Account';
import { SpotifyService } from '../../../services/SpotifyService';
import { AccountService } from '../../../services/AccountService';

export const getSpotify = async (req: Request, res: Response) => {
    async function updateTokens(account: AccountDocument, newAccessToken: string) {
        account.spotifyAccessToken = newAccessToken || account.spotifyAccessToken;
        account.spotifyAccessTokenExpires = Date.now() + Number(3600) * 1000;

        return await account.save();
    }

    let account: AccountDocument = await AccountService.get(req.params.sub);

    if (!account.spotifyAccessToken || !account.spotifyRefreshToken) {
        return res.json({ isAuthorized: false });
    }

    if (Date.now() >= account.spotifyAccessTokenExpires) {
        const tokens = await SpotifyService.refreshTokens(account.spotifyRefreshToken);
        account = await updateTokens(account, tokens);
    }

    const user = await SpotifyService.getUser(account.spotifyAccessToken);
    const playlists = await SpotifyService.getPlaylists(account.spotifyAccessToken);
    const playlistItems = await Promise.all(
        playlists.map((playlist) => SpotifyService.getPlaylistItems(account.spotifyAccessToken, playlist.id)),
    );

    res.json({
        isAuthorized: true,
        playlists: playlists,
        items: playlistItems.flat(),
        users: [user],
    });
};
