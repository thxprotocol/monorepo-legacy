import { Request, Response } from 'express';
import { SpotifyService } from '../../../services/SpotifyService';
import { AccountService } from '../../../services/AccountService';

export async function getSpotifyTrackPlaying(req: Request, res: Response) {
    const account = await AccountService.get(req.params.sub);
    const result = await SpotifyService.validateTrackPlaying(account.spotifyAccessToken, req.params.item);

    res.json({ result });
}

export async function getSpotifyTrackRecent(req: Request, res: Response) {
    const account = await AccountService.get(req.params.sub);
    const result = await SpotifyService.validateRecentTrack(account.spotifyAccessToken, req.params.item);

    res.json({ result });
}

export async function getSpotifyTrackSaved(req: Request, res: Response) {
    const account = await AccountService.get(req.params.sub);
    const result = await SpotifyService.validateSavedTracks(account.spotifyAccessToken, [req.params.item]);

    res.json({ result });
}
