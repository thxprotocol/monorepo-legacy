import { AUTH_URL, BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '../config/secrets';
import { AccountDocument } from '../models/Account';
import CommonOauthLoginOptions from '../types/CommonOauthLoginOptions';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { discordClient } from '../util/axios';
import { IAccessToken } from '@thxnetwork/types/interfaces';

export const scopes = ['identify', 'email', 'guilds', 'guilds.join', 'guilds.members.read'];

const ERROR_NO_DATA = 'Could not find an Discord data for this accesstoken';
const ERROR_NOT_AUTHORIZED = 'Not authorized for Discord API';
const ERROR_TOKEN_REQUEST_FAILED = 'Failed to request access token';

class DiscordService {
    static async isAuthorized(account: AccountDocument) {
        const token = account.getToken(AccessTokenKind.Discord);
        if (!token || !token.accessToken) return false;
        const isExpired = Date.now() > token.expiry;
        if (isExpired) {
            try {
                const res = await this.refreshTokens(token.refreshToken);
                account.setToken({
                    kind: AccessTokenKind.Discord,
                    accessToken: res.access_token,
                    expiry: Date.now() + Number(res.expires_in) * 1000,
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

    static async getTokens(code: string): Promise<{ tokenInfo: IAccessToken; email: string }> {
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
        const { user } = await this.getUser(r.data.access_token);

        return {
            email: user.email,
            tokenInfo: {
                kind: AccessTokenKind.Discord,
                expiry: r.data.expires_in,
                accessToken: r.data.access_token,
                refreshToken: r.data.refresh_token,
                userId: user.id,
            },
        };
    }

    static async refreshTokens(refreshToken: string) {
        const body = new URLSearchParams();

        body.append('grant_type', 'refresh_token');
        body.append('refresh_token', refreshToken);
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

        if (r.status !== 200) throw new Error(ERROR_TOKEN_REQUEST_FAILED);

        return r.data;
    }

    static async getUser(accessToken: string) {
        // {
        //     "application": {
        //         "id": "159799960412356608",
        //         "name": "AIRHORN SOLUTIONS",
        //         "icon": "f03590d3eb764081d154a66340ea7d6d",
        //         "description": "",
        //         "hook": true,
        //         "bot_public": true,
        //         "bot_require_code_grant": false,
        //         "verify_key": "c8cde6a3c8c6e49d86af3191287b3ce255872be1fff6dc285bdb420c06a2c3c8"
        //     },
        //     "scopes": [
        //         "guilds.join",
        //         "identify"
        //     ],
        //     "expires": "2021-01-23T02:33:17.017000+00:00",
        //     "user": {
        //         "id": "268473310986240001",
        //         "username": "Discord",
        //         "avatar": "f749bb0cbeeb26ef21eca719337d20f1",
        //         "discriminator": "0001",
        //         "public_flags": 131072
        //     }
        // }
        const r = await discordClient({
            url: '/oauth2/@me',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);
        if (!r.data) throw new Error(ERROR_NO_DATA);

        return r.data;
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

        if (r.status !== 200) throw new Error(ERROR_NOT_AUTHORIZED);

        return r.data;
    }

    static async validateUserJoined(account: AccountDocument, guildId: string) {
        const token = account.getToken(AccessTokenKind.Discord);
        const guilds = await this.getGuilds(token.accessToken);
        const isUserJoinedGuild = guilds.find((guild) => guild.id === guildId);
        if (isUserJoinedGuild) return { result: true };
        return { result: false, reason: 'Discord: Your Discord account is not a member of this server.' };
    }
}

export { DiscordService };
