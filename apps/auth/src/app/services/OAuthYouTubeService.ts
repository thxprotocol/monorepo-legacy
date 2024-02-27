import axios from 'axios';
import { google } from 'googleapis';
import { AccessTokenKind, OAuthGoogleScope } from '@thxnetwork/common/enums/AccessTokenKind';
import { AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../config/secrets';
import { parseJwt } from '../util/jwt';
import { Token, TokenDocument } from '../models/Token';
import { IOAuthService } from '../services/interfaces/IOAuthService';
import { logger } from '../util/logger';

const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_URL + '/oidc/callback/google');

google.options({ auth: client });

export default class YouTubeService implements IOAuthService {
    getLoginURL({ uid, scopes }: { uid: string; scopes: OAuthGoogleScope[] }) {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        return client.generateAuthUrl({
            state,
            access_type: 'offline',
            scope: scopes,
        });
    }

    async requestToken(code: string) {
        const { tokens } = await client.getToken(code);
        const expiry = tokens.expiry_date ? Date.now() + Number(tokens.expiry_date) : undefined;
        const claims = await parseJwt(tokens.id_token);

        return {
            kind: AccessTokenKind.Google,
            expiry,
            scopes: tokens.scope.split(' ') as OAuthGoogleScope[],
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
        try {
            const url = new URL('https://oauth2.googleapis.com/revoke');
            if (token.accessToken) {
                await axios({ url: url.toString(), method: 'POST', params: { token: token.accessToken } });
            }
            if (token.refreshToken) {
                await axios({ url: url.toString(), method: 'POST', params: { token: token.refreshToken } });
            }
        } catch (error) {
            logger.error(error);
        }
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
}
