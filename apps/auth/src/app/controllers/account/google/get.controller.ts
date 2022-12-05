import { AccessTokenKind } from '@thxnetwork/auth/types/enums/AccessTokenKind';
import { IAccessToken } from '@thxnetwork/auth/types/TAccount';
import { Request, Response } from 'express';
import { AccountService } from '../../../services/AccountService';
import { YouTubeService } from '../../../services/YouTubeService';

export const getYoutube = async (req: Request, res: Response) => {
    const account = await AccountService.get(req.params.sub);

    const token: IAccessToken | undefined = account.getToken(AccessTokenKind.Google);
    if (!token) {
        return res.json({ isAuthorized: false });
    }

    const haveExpandedScopes = await YouTubeService.haveExpandedScopes(token.accessToken);

    if (!token.accessToken || !token.refreshToken || !haveExpandedScopes) {
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
