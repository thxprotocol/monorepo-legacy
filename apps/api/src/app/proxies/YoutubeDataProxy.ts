import type { TAccount } from '@thxnetwork/types/interfaces';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';
import { AccessTokenKind } from '@thxnetwork/common/lib/types';

class NoYoutubeDataError extends THXError {
    message = 'Could not find youtube data for this account';
}

export default class YoutubeDataProxy {
    static async getUserId(account: TAccount) {
        const { data } = await authClient({
            method: 'GET',
            url: `/account/${account.sub}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        const token = data.connectedAccounts.find((token) => token.kind === AccessTokenKind.Google);
        if (!token) return;
        return token.userId;
    }

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

    static async validateLike(account: TAccount, channelItem: string) {
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

    static async validateSubscribe(account: TAccount, channelItem: string) {
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
