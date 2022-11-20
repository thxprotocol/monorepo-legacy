import { GithubService } from './../../../services/GithubServices';
import { Request, Response } from 'express';
import { AUTH_URL, WALLET_URL } from '../../../config/secrets';
import { SpotifyService } from '../../../services/SpotifyService';
import { TwitterService } from '../../../services/TwitterService';
import { YouTubeService } from '../../../services/YouTubeService';
import { AUTH_REQUEST_TYPED_MESSAGE, createTypedMessage } from '../../../util/typedMessage';
import { DiscordService } from '@thxnetwork/auth/services/DiscordService';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;
    params.googleLoginUrl = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes());
    params.githubLoginUrl = GithubService.getLoginURL(uid, {});
    params.discordLoginUrl = DiscordService.getLoginURL(uid, {})

    if (params.return_url === WALLET_URL) {
        params.githubLoginUrl = GithubService.getLoginURL(uid, {});
        params.twitterLoginUrl = TwitterService.getLoginURL(uid, {});
        params.spotifyLoginUrl = SpotifyService.getLoginURL(uid, {});
        params.discordLoginUrl = DiscordService.getLoginURL(uid, {});

        params.authRequestMessage = createTypedMessage(AUTH_REQUEST_TYPED_MESSAGE, AUTH_URL, uid);
    }

    res.render('signin', { uid, params, alert: {} });
}

export default { controller };
