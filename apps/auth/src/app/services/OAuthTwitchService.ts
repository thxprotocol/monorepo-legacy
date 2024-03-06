import { AUTH_URL, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } from '@thxnetwork/auth/config/secrets';
import { AccessTokenKind, OAuthTwitchScope } from '@thxnetwork/common/enums/AccessTokenKind';
import { twitchClient } from '../util/axios';
import { IOAuthService } from './interfaces/IOAuthService';
import { Token, TokenDocument } from '../models/Token';

export default class TwitchService implements IOAuthService {
    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthTwitchScope[] }) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const url = new URL('https://id.twitch.tv/oauth2/authorize');
        url.searchParams.append('state', state);
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('force_verify', 'true');
        url.searchParams.append('client_id', TWITCH_CLIENT_ID);
        url.searchParams.append('redirect_uri', AUTH_URL + '/oidc/callback/twitch');
        url.searchParams.append('scope', scopes.join(' '));

        return url.toString();
    }

    async requestToken(code: string): Promise<Partial<TToken>> {
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

        return {
            kind: AccessTokenKind.Twitch,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry: Date.now() + Number(data.expires_in) * 1000,
            userId: user.id,
        };
    }

    async refreshToken(token: TokenDocument) {
        const body = new URLSearchParams();
        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', token.refreshToken);
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

        return await Token.findByIdAndUpdate(
            token._id,
            {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiry: Date.now() + Number(data.expires_in) * 1000,
            },
            { new: true },
        );
    }

    revokeToken(token: TokenDocument): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private async getUser(accessToken: string) {
        const { data } = await twitchClient({
            url: 'https://id.twitch.tv/oauth2/userinfo',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return data;
    }
}
