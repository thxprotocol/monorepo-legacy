import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI } from '@thxnetwork/auth/config/secrets';
import { AccountDocument } from '../models/Account';
import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { AccessTokenKind } from '../types/enums/AccessTokenKind';
import { twitchClient } from '../util/axios';

export const TWITCH_API_SCOPE = ['user:read:follows', 'user:read:email', 'user:read:broadcast'];

const ERROR_NO_DATA = 'Could not find an Twitch data for this accesstoken';
const ERROR_NOT_AUTHORIZED = 'Not authorized for Twitch API';
const ERROR_TOKEN_REQUEST_FAILED = 'Failed to request access token';

class TwitchService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Twitch);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) return false;
        return true;
    }

    static getLoginURL(
        state: string,
        { scope = TWITCH_API_SCOPE, redirectUrl = TWITCH_REDIRECT_URI }: CommonOauthLoginOptions,
    ) {
        const body = new URLSearchParams();

        if (state) body.append('state', state);
        body.append('response_type', 'code');
        body.append('force_verify', 'true');
        body.append('client_id', TWITCH_CLIENT_ID);
        body.append('redirect_uri', redirectUrl);
        body.append('scope', scope.join(' '));

        return `https://id.twitch.tv/oauth2/authorize?${body.toString()}`;
    }

    static async requestTokens(code: string) {
        const body = new URLSearchParams();

        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('redirect_uri', TWITCH_REDIRECT_URI);
        body.append('client_secret', TWITCH_CLIENT_SECRET);
        body.append('client_id', TWITCH_CLIENT_ID);

        const r = await twitchClient({
            url: 'https://id.twitch.tv/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });

        if (r.status !== 200) {
            throw new Error(ERROR_TOKEN_REQUEST_FAILED);
        }

        return r.data;
    }

    static async refreshTokens(refreshToken: string) {
        const body = new URLSearchParams();

        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', refreshToken);
        body.append('client_secret', TWITCH_CLIENT_SECRET);
        body.append('client_id', TWITCH_CLIENT_ID);

        const r = await twitchClient({
            url: 'https://id.twitch.tv/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });

        if (r.status !== 200) throw new Error(ERROR_TOKEN_REQUEST_FAILED);

        return r.data.access_token;
    }

    static async getUser(accessToken: string) {
        const r = await twitchClient({
            url: 'https://id.twitch.tv/oauth2/userinfo',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        const r2 = await twitchClient({
            url: '/users',
            method: 'GET',
            params: {
                id: r.data.sub,
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Client-Id': TWITCH_CLIENT_ID,
            },
        });

        return r2.data;
    }
}

export { TwitchService };
