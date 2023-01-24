import { DiscordService } from '@thxnetwork/auth/services/DiscordService';
import GithubService from '@thxnetwork/auth/services/GithubServices';
import { TwitchService } from '@thxnetwork/auth/services/TwitchService';
import { YouTubeService } from '@thxnetwork/auth/services/YouTubeService';
import { track } from '@thxnetwork/auth/util/mixpanel';
import { Request, Response } from 'express';

async function controller(req: Request, res: Response) {
    const { uid, params } = req.interaction;

    params.googleLoginUrl = YouTubeService.getLoginUrl(req.params.uid, YouTubeService.getBasicScopes());
    params.githubLoginUrl = GithubService.getLoginURL(uid, {});
    params.discordLoginUrl = DiscordService.getLoginURL(uid, {});
    params.twitchLoginUrl = TwitchService.getLoginURL(uid, {});

    track.UserVisits(params.distinct_id, `oidc sign up`, [uid, params.return_url]);

    res.render('signup', { uid, params });
}

export default { controller };
