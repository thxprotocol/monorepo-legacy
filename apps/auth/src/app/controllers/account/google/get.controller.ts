import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { YouTubeService } from '../../../services/YouTubeService';

export const getYoutube = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);
    const haveExpandedScopes = await YouTubeService.haveExpandedScopes(account.googleAccessToken);

    if (!account.googleAccessToken || !account.googleRefreshToken || !haveExpandedScopes) {
        return res.json({ isAuthorized: false });
    }

    const channels = haveExpandedScopes ? await YouTubeService.getChannelList(account) : [];
    const videos = haveExpandedScopes ? await YouTubeService.getVideoList(account) : [];
    res.json({
        isAuthorized: haveExpandedScopes,
        channels,
        videos,
    });
};
