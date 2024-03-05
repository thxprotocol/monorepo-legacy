import { AUTH_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '../config/secrets';
import { AccessTokenKind, OAuthDiscordScope } from '@thxnetwork/common/enums/AccessTokenKind';
import { discordClient } from '../util/axios';
import { Token, TokenDocument } from '../models/Token';
import { IOAuthService } from './interfaces/IOAuthService';

export default class DiscordService implements IOAuthService {
    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthDiscordScope[] }): string {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const url = new URL('https://discord.com/oauth2/authorize');
        url.searchParams.append('state', state);
        url.searchParams.append('response_type', 'code');
        url.searchParams.append('client_id', DISCORD_CLIENT_ID);
        url.searchParams.append('redirect_uri', AUTH_URL + '/oidc/callback/discord');
        url.searchParams.append('scope', scopes.join(' '));

        return url.toString();
    }

    async requestToken(code: string) {
        const body = new URLSearchParams();
        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/discord');
        body.append('client_secret', DISCORD_CLIENT_SECRET);
        body.append('client_id', DISCORD_CLIENT_ID);

        const { data } = await discordClient({
            url: 'https://discord.com/api/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });
        const user = await this.getUser(data.access_token);

        return {
            kind: AccessTokenKind.Discord,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry: Date.now() + Number(data.expires_in) * 1000,
            scopes: data.scope.split(' '),
            userId: user.id,
        };
    }

    async refreshToken(token: TokenDocument) {
        const body = new URLSearchParams();
        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', token.refreshToken);
        body.append('client_secret', DISCORD_CLIENT_SECRET);
        body.append('client_id', DISCORD_CLIENT_ID);

        const { data } = await discordClient({
            url: 'https://discord.com/api/oauth2/token',
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
                expiry: data.expires_in && Date.now() + Number(data.expires_in) * 1000,
            },
            { new: true },
        );
    }

    async revokeToken(token: TokenDocument): Promise<void> {
        const body = new URLSearchParams();
        body.append('client_secret', DISCORD_CLIENT_SECRET);
        body.append('client_id', DISCORD_CLIENT_ID);
        body.append('token', token.accessToken);

        await discordClient({
            url: 'https://discord.com/api/oauth2/token/revoke',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });
    }

    private async getUser(accessToken: string) {
        const { data } = await discordClient({
            url: '/oauth2/@me',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        return data.user;
    }
}
