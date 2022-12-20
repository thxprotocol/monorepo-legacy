import type { IAccount } from '@thxnetwork/api/models/Account';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';

class NoYoutubeDataError extends THXError {
    message = 'Could not find youtube data for this account';
}

export default class YoutubeDataProxy {
    static async getYoutube(sub: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}/google/youtube`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoYoutubeDataError();

        return { isAuthorized: r.data.isAuthorized, channels: r.data.channels, videos: r.data.videos };
    }

    static async validateLike(account: IAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/google/youtube/like/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoYoutubeDataError();

        return r.data.result;
    }

    static async validateSubscribe(account: IAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.sub}/google/youtube/subscribe/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoYoutubeDataError();

        return r.data.result;
    }
}
