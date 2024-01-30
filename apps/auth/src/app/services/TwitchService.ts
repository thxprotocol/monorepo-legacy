import { AUTH_URL, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '@thxnetwork/auth/config/secrets';
import { AccountDocument } from '../models/Account';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { twitchClient } from '../util/axios';
import TokenService from './TokenService';
import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { TToken } from '@thxnetwork/common/lib/types';

export const TWITCH_API_SCOPE = ['user:read:follows', 'user:read:email', 'user:read:broadcast'];

const ERROR_NO_DATA = 'Could not find an Twitch data for this accesstoken';
const ERROR_NOT_AUTHORIZED = 'Not authorized for Twitch API';
const ERROR_TOKEN_REQUEST_FAILED = 'Failed to request access token';

class TwitchService {
    static async isAuthorized(account: AccountDocument) {
        const token = await TokenService.getToken(account, AccessTokenKind.Twitch);
        if (!token || !token.accessToken) return false;

        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const accessToken = await this.refreshTokens(token.refreshToken);
                await TokenService.setToken(account, {
                    kind: AccessTokenKind.Twitch,
                    accessToken,
                    expiry: Date.now() + Number(3600) * 1000,
                });
            } catch {
                return false;
            }
        }
        return true;
    }

    static getLoginURL(
        state: string,
        { scope = TWITCH_API_SCOPE, redirectUrl = AUTH_URL + '/oidc/callback/twitch' }: CommonOauthLoginOptions,
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

    static async getTokens(code: string): Promise<Partial<TToken>> {
        const body = new URLSearchParams();

        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/twitch');
        body.append('client_secret', TWITCH_CLIENT_SECRET);
        body.append('client_id', TWITCH_CLIENT_ID);

        const { data } = await twitchClient({
            url: 'https://id.twitch.tv/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });

        const user = await this.getUser(data.access_token);
        const expiry = data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined;

        return {
            kind: AccessTokenKind.Twitch,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry,
            userId: user.id,
        };
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
