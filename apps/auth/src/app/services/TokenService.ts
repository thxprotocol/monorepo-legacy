import { AccessTokenKind, OAuthScope } from '@thxnetwork/common/lib/types';
import { Token, TokenDocument } from '../models/Token';
import { AccountDocument } from '../models/Account';
import { decryptString } from '../util/decrypt';
import { SECURE_KEY } from '../config/secrets';
import { IOAuthService } from './interfaces/IOAuthService';
import DiscordService from './OAuthDiscordService';
import TwitterService from './OAuthTwitterService';
import TwitchService from './OAuthTwitchService';
import YouTubeService from './OAuthYouTubeService';
import GithubService from './OAuthGithubService';

const serviceMap: { [variant: string]: IOAuthService } = {
    [AccessTokenKind.Twitter]: new TwitterService(),
    [AccessTokenKind.Google]: new YouTubeService(),
    [AccessTokenKind.Discord]: new DiscordService(),
    [AccessTokenKind.Twitch]: new TwitchService(),
    [AccessTokenKind.Github]: new GithubService(),
};

export default class TokenService {
    static getLoginURL({ kind, uid, scopes }: { kind: AccessTokenKind; uid: string; scopes: OAuthScope[] }) {
        return serviceMap[kind].getLoginURL({ uid, scopes });
    }

    static requestToken({ kind, code }: { kind: AccessTokenKind; code: string }) {
        return serviceMap[kind].requestToken(code);
    }

    static revokeToken(token: TokenDocument) {
        return serviceMap[token.kind].revokeToken(token);
    }

    static async refreshToken(account: AccountDocument, scope: OAuthScope) {
        // Check if token exists for account
        const token = await TokenService.getToken(account, { scope });
        if (!token) return;

        // Check if token is expired
        const isExpired = Date.now() > token.expiry;
        if (!isExpired) return token;

        // If so, refresh the token and return
        return await serviceMap[token.kind].refreshToken(token);
    }

    static async list(account: AccountDocument) {
        const tokens = await Token.find({ sub: account._id });

        return tokens.map((token: TokenDocument) => {
            const { accessTokenEncrypted, refreshTokenEncrypted } = token;
            const accessToken = accessTokenEncrypted && decryptString(accessTokenEncrypted, SECURE_KEY);
            const refreshToken = refreshTokenEncrypted && decryptString(refreshTokenEncrypted, SECURE_KEY);

            return { ...token.toJSON(), accessToken, refreshToken };
        });
    }

    static getToken(
        account: AccountDocument,
        query: { scope?: string; kind?: AccessTokenKind },
    ): Promise<TokenDocument> {
        return Token.findOne({ sub: account._id, ...query });
    }

    static setToken(account: AccountDocument, token: Partial<TokenDocument>) {
        return Token.findOneAndUpdate(
            { sub: account._id, kind: token.kind },
            { ...token, sub: account._id },
            { upsert: true, new: true },
        );
    }

    static async unsetToken(account: AccountDocument, kind: AccessTokenKind) {
        const token = await this.getToken(account, { kind });

        // Revoke access at token provider
        await this.revokeToken(token);

        // Remove from storage
        return await Token.findOneAndDelete({ sub: account._id, kind });
    }

    static findTokenForUserId(userId: string, kind: AccessTokenKind) {
        return Token.findOne({ userId, kind });
    }
}
