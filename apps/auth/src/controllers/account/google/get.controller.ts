import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { YouTubeService } from '../../../services/YouTubeService';

export const getYoutube = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);

    if (!account.googleAccessToken || !account.googleRefreshToken) {
        return res.json({ isAuthorized: false });
    }

    const haveExpandedScopes = await YouTubeService.haveExpandedScopes(account.googleAccessToken);
    const channels = haveExpandedScopes ? await YouTubeService.getChannelList(account) : [];
    const videos = haveExpandedScopes ? await YouTubeService.getVideoList(account) : [];

    res.json({
        isAuthorized: haveExpandedScopes,
        channels,
        videos,
    });
};
