import { URLSearchParams } from 'url';
import { TToken } from '@thxnetwork/common/lib/types';
import { twitterClient } from '../util/axios';
import { AUTH_URL, TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from '../config/secrets';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
import { IOAuthService } from '../services/interfaces/IOAuthService';
import { Token, TokenDocument } from '../models/Token';

export default class TwitterService implements IOAuthService {
    getLoginURL({ uid, scope }: { uid: string; scope: string }): string {
        const state = Buffer.from(JSON.stringify({ uid })).toString('base64');
        const redirectURL = AUTH_URL + '/oidc/callback/twitter';
        const authorizeURL = new URL('https://twitter.com/i/oauth2/authorize');

        authorizeURL.searchParams.append('response_type', 'code');
        authorizeURL.searchParams.append('client_id', TWITTER_CLIENT_ID);
        authorizeURL.searchParams.append('redirect_uri', redirectURL);
        authorizeURL.searchParams.append('scope', scope.split(' ').join('%20'));
        authorizeURL.searchParams.append('state', state);
        authorizeURL.searchParams.append('code_challenge', 'challenge');
        authorizeURL.searchParams.append('code_challenge_method', 'plain');

        return authorizeURL.toString();
    }

    async requestToken(code: string): Promise<Partial<TToken>> {
        const authHeader = 'Basic ' + Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
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
                'Authorization': authHeader,
            },
            data: body,
        });
        const expiry = data.expires_in ? Date.now() + Number(data.expires_in) * 1000 : undefined;
        const user = await this.getUser(data.access_token);
        // TODO Get scopes from token
        const scope = '';

        return {
            kind: AccessTokenKind.Twitter,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry,
            scope,
            userId: user.id,
            metadata: {
                name: user.name,
                username: user.username,
            },
        };
    }

    async refreshToken(token: TokenDocument) {
        const authHeader = 'Basic ' + Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
        const body = new URLSearchParams();
        body.append('refresh_token', token.refreshToken);
        body.append('grant_type', 'refresh_token');
        body.append('client_id', TWITTER_CLIENT_ID);

        const { data } = await twitterClient({
            url: '/oauth2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authHeader,
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
        const { data } = await twitterClient({
            url: '/users/me',
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return data.data;
    }
}
