import { IAccount } from '@thxnetwork/api/models/Account';
import { authClient, getAuthAccessToken } from '@thxnetwork/api/util/auth';
import { THXError } from '@thxnetwork/api/util/errors';

const NO_USER = 'Could not find spotify data for this account';

class NoSpotifyDataError extends THXError {
    message = 'Could not find twitter data for this account';
}

export default class SpotifyDataProxy {
    static async getSpotify(sub: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${sub}/spotify`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (r.status !== 200) throw new Error(NO_USER);
        if (!r.data) throw new Error(NO_USER);

        return r.data;
    }

    static async validateUserFollow(account: IAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.id}/spotify/user_follow/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoSpotifyDataError();
        return r.data.result[channelItem];
    }

    static async validatePlaylistFollow(account: IAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.id}/spotify/playlist_follow/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        const spotifyUser = await this.getSpotify(account.id);
        if (!r.data) throw new NoSpotifyDataError();

        return r.data.result[spotifyUser.users[0].id];
    }
    static async validateTrackPlaying(account: IAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.id}/spotify/track_playing/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoSpotifyDataError();

        return r.data.result;
    }
    static async validateRecentTrack(account: IAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.id}/spotify/track_recent/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoSpotifyDataError();

        return r.data.result;
    }
    static async validateSavedTracks(account: IAccount, channelItem: string) {
        const r = await authClient({
            method: 'GET',
            url: `/account/${account.id}/spotify/track_saved/${channelItem}`,
            headers: {
                Authorization: await getAuthAccessToken(),
            },
        });

        if (!r.data) throw new NoSpotifyDataError();

        return r.data.result[channelItem];
    }
}
