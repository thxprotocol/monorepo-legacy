import { AUTH_URL, BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '../config/secrets';
import { AccountDocument } from '../models/Account';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { discordClient } from '../util/axios';
import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import TokenService from './TokenService';
import { TToken } from '@thxnetwork/common/lib/types';

export const scopes = ['identify', 'email', 'guilds'];

class DiscordService {
    static async isAuthorized(account: AccountDocument) {
        const token = await TokenService.getToken(account, AccessTokenKind.Discord);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const res = await this.refreshTokens(token.refreshToken);
                await TokenService.setToken(account, {
                    kind: AccessTokenKind.Discord,
                    accessToken: res.access_token,
                    expiry: Date.now() + Number(res.expires_in) * 1000,
                    userId: token.userId,
                });
                await account.save();
            } catch {
                return false;
            }
        }
        return true;
    }

    static getLoginURL(
        uid: string,
        { scope = scopes, redirectUrl = AUTH_URL + '/oidc/callback/discord' }: CommonOauthLoginOptions,
    ) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const body = new URLSearchParams();

        if (uid) body.append('state', state);
        body.append('response_type', 'code');
        body.append('client_id', DISCORD_CLIENT_ID);
        body.append('redirect_uri', redirectUrl);
        body.append('scope', scope.join(' '));

        return `https://discord.com/oauth2/authorize?${body.toString()}`;
    }

    static async getTokens(code: string) {
        const body = new URLSearchParams();

        body.append('code', code);
        body.append('grant_type', 'authorization_code');
        body.append('redirect_uri', AUTH_URL + '/oidc/callback/discord');
        body.append('client_secret', DISCORD_CLIENT_SECRET);
        body.append('client_id', DISCORD_CLIENT_ID);

        const r = await discordClient({
            url: 'https://discord.com/api/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: body,
        });
        const user = await this.getMe(r.data.access_token);

        return {
            kind: AccessTokenKind.Discord,
            expiry: r.data.expires_in,
            accessToken: r.data.access_token,
            refreshToken: r.data.refresh_token,
            userId: user.id,
        };
    }

    static async refreshTokens(refreshToken: string) {
        const body = new URLSearchParams();
        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', refreshToken);
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

        return data;
    }

    static async getMe(accessToken: string) {
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

    static async addToGuild(accessToken: string, userId: string, guildId: string) {
        const { data } = await discordClient({
            method: 'PUT',
            url: `/guilds/${guildId}/members/${userId}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bot ${BOT_TOKEN}`,
            },
            data: {
                access_token: accessToken,
            },
        });
        return data;
    }

    static async sendMessage(accessToken: string, channelId: string, content: string) {
        const { data } = await discordClient({
            method: 'POST',
            url: `/channels/${channelId}/messages`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bot ${BOT_TOKEN}`,
            },
            data: {
                access_token: accessToken,
                content,
            },
        });
        return data;
    }

    static async getGuilds(accessToken: string) {
        const r = await discordClient({
            method: 'GET',
            url: '/users/@me/guilds',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        return r.data;
    }

    static async validateUserJoined(account: AccountDocument, guildId: string) {
        const token = await TokenService.getToken(account, AccessTokenKind.Discord);
        const guilds = await this.getGuilds(token.accessToken);
        const isUserJoinedGuild = guilds.find((guild) => guild.id === guildId);
        if (isUserJoinedGuild) return { result: true };
        return { result: false, reason: 'Discord: Your Discord account is not a member of this server.' };
    }
}

export { DiscordService };
