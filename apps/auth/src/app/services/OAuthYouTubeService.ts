import axios from 'axios';
import { google } from 'googleapis';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/secrets';
import { parseJwt } from '../util/jwt';
import { Token, TokenDocument } from '../models/Token';
import { IOAuthService } from '../services/interfaces/IOAuthService';

const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_URL + '/oidc/callback/google');

google.options({ auth: client });

export default class YouTubeService implements IOAuthService {
    getLoginURL({ uid, scope }: { uid: string; scope: string }) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        return client.generateAuthUrl({
            state,
            access_type: 'offline',
            scope: scope.split(' '),
        });
    }

    async requestToken(code: string) {
        const { tokens } = await client.getToken(code);
        const expiry = tokens.expiry_date ? Date.now() + Number(tokens.expiry_date) * 1000 : undefined;
        const claims = await parseJwt(tokens.id_token);
        const scope = '';

        return {
            kind: AccessTokenKind.Google,
            expiry,
            scope,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            userId: claims.sub,
        };
    }

    async refreshToken(token: TokenDocument): Promise<TokenDocument> {
        const refreshToken = await this.getRefreshToken(token);

        client.setCredentials({
            refresh_token: refreshToken,
            access_token: token.accessToken,
        });

        const googleToken = await client.getAccessToken();
        const { expiry_date, sub, scopes } = await client.getTokenInfo(googleToken.token);

        return await Token.findByIdAndUpdate(
            token._id,
            {
                accessToken: googleToken,
                refreshToken,
                expiry: expiry_date,
                scope: scopes.join(' '),
                userId: sub,
            },
            { new: true },
        );
    }

    async revokeToken(token: TokenDocument): Promise<void> {
        const url = new URL('https://oauth2.googleapis.com/revoke');
        url.searchParams.append('token', token.accessToken);

        await axios({ url: url.toString(), method: 'POST' });
    }

    // We only get one refreshToken from google and should use it for
    // all token variations we store
    private async getRefreshToken({ sub }: TokenDocument) {
        const [token] = await Token.find({
            scope: { $in: ['google', 'youtube-view', 'youtube-manage'] },
            refreshToken: { $exists: true, $ne: '' },
            sub,
        });
        return token && token.refreshToken;
    }

    // async getYoutubeClient(account: AccountDocument, kind: AccessTokenKind) {
    //     const { accessToken } = await TokenService.getToken(account, kind);
    //     const refreshToken = this.getRefreshToken(account);

    //     client.setCredentials({
    //         refresh_token: refreshToken,
    //         access_token: accessToken,
    //     });

    //     const { token } = await client.getAccessToken();
    //     const { expiry_date } = await client.getTokenInfo(token);

    //     await TokenService.setToken(account, {
    //         kind: AccessTokenKind.YoutubeView,
    //         accessToken: token,
    //         refreshToken: refreshToken,
    //         expiry: expiry_date,
    //     });
    //     await account.save();

    //     return google.youtube({ version: 'v3' });
    // }

    // async validateLike(account: AccountDocument, channelItem: string) {
    //     const youtube = await this.getYoutubeClient(account, AccessTokenKind.YoutubeManage);
    //     const r = await youtube.videos.getRating({
    //         id: [channelItem],
    //     });
    //     if (!r.data) {
    //         throw new Error(ERROR_NO_DATA);
    //     }
    //     return r.data.items.length ? r.data.items[0].rating == 'like' : false;
    // }
    // async validateSubscribe(account: AccountDocument, channelItem: string) {
    //     const youtube = await this.getYoutubeClient(account, AccessTokenKind.YoutubeManage);
    //     const r = await youtube.subscriptions.list({
    //         forChannelId: channelItem,
    //         part: ['snippet'],
    //         mine: true,
    //     });

    //     if (!r.data) {
    //         throw new Error(ERROR_NO_DATA);
    //     }

    //     return r.data.items.length > 0;
    // }
}
