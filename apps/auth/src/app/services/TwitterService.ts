import { URLSearchParams } from 'url';
import { twitterClient } from '../util/axios';
import { AUTH_URL, TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from '../config/secrets';
import { AccountDocument } from '../models/Account';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import CommonOauthLoginOptions from '@thxnetwork/auth/types/CommonOauthLoginOptions';
import TokenService from '../services/TokenService';
import { TToken } from '@thxnetwork/common/lib/types';

export class TwitterService {
    static async isAuthorized(account: AccountDocument) {
        const token = await TokenService.getToken(account, AccessTokenKind.Twitter);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const tokens = await this.refreshTokens(token.refreshToken);
                const expiry = tokens.expires_in ? Date.now() + Number(tokens.expires_in) * 1000 : undefined;

                await TokenService.setToken(account, {
                    kind: AccessTokenKind.Twitter,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiry,
                });
            } catch (error) {
                return false;
            }
        }
        return true;
    }

    static async getMe(accessToken: string) {
        const { data } = await twitterClient({
            url: '/users/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data.data;
    }

    static async refreshTokens(refreshToken: string) {
        const data = new URLSearchParams();
        data.append('refresh_token', refreshToken);
        data.append('grant_type', 'refresh_token');
        data.append('client_id', TWITTER_CLIENT_ID);

        const r = await twitterClient({
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64'),
            },
            data,
        });
        return r.data;
    }

    static async getTokens(code: string): Promise<Partial<TToken>> {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('client_id', TWITTER_CLIENT_ID);
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/twitter');
        body.append('code_verifier', 'challenge');

        const { data } = await twitterClient({
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization':
                    'Basic ' + Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64'),
            },
            data: body,
        });
        const expiry = data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined;
        const user = await this.getMe(data.access_token);

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry,
            userId: user.id,
            metadata: {
                name: user.name,
                username: user.username,
            },
        };
    }

    static getScopes() {
        return ['tweet.read', 'users.read', 'like.read', 'follows.read', 'follows.write', 'offline.access'];
    }

    static getLoginURL(
        uid: string,
        { scope = this.getScopes(), redirectUrl = AUTH_URL + '/oidc/callback/twitter' }: CommonOauthLoginOptions,
    ) {
        const stateSerialized = JSON.stringify({ uid });
        const state = Buffer.from(stateSerialized).toString('base64');

        return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scope.join(
            '%20',
        )}&code_challenge=challenge&code_challenge_method=plain&state=${state}`;
    }
}
