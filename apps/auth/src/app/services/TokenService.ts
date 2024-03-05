import { AccessTokenKind, OAuthScope } from '@thxnetwork/common/enums';
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
import { logger } from '../util/logger';

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

    static request({ kind, code }: { kind: AccessTokenKind; code: string }) {
        return serviceMap[kind].requestToken(code);
    }

    static revoke(token: TokenDocument) {
        return serviceMap[token.kind].revokeToken(token);
    }

    static async refresh(token: TokenDocument) {
        // Return token if there is no expiry or no refreshtoken
        if (!token || !token.expiry || !token.refreshToken) return token;

        // Check if token is expired
        const isExpired = Date.now() > token.expiry;
        if (!isExpired) return token;

        try {
            // If so, refresh the token and return
            return await serviceMap[token.kind].refreshToken(token);
        } catch (error) {
            logger.error(error);
            logger.error('Token refresh failed');
            return token;
        }
    }

    static async getToken(account: AccountDocument, kind: AccessTokenKind): Promise<TokenDocument> {
        const token = await Token.findOne({ sub: account._id, kind });
        if (!token) return;

        const { accessTokenEncrypted, refreshTokenEncrypted } = token;
        const accessToken = accessTokenEncrypted && decryptString(accessTokenEncrypted, SECURE_KEY);
        const refreshToken = refreshTokenEncrypted && decryptString(refreshTokenEncrypted, SECURE_KEY);
        const refreshedToken = await this.refresh(token);

        return { ...refreshedToken.toJSON(), accessToken, refreshToken };
    }

    static async connect(account: AccountDocument, token: Partial<TokenDocument>) {
        // Check if any other accounts are using this token
        const tokens = await Token.find({ kind: token.kind, userId: token.userId, sub: { $ne: String(account._id) } });
        if (tokens.length) {
            throw new Error('Already connect to another THX account! Please disconnect that account first.');
        }

        // Check if this account already has a token but with another userId
        const existingToken = await Token.findOne({ sub: String(account._id), kind: token.kind });
        if (existingToken && existingToken.userId !== token.userId) {
            throw new Error(
                'Already connected to a different account from this provider! Please disconnect that account first.',
            );
        }

        // Store the token for the account
        return await this.setToken(account, token);
    }

    static async setToken(account: AccountDocument, token: Partial<TokenDocument>) {
        // Store the token for the new account
        return Token.findOneAndUpdate(
            { sub: account._id, kind: token.kind },
            { ...token, sub: account._id },
            { upsert: true, new: true },
        );
    }

    static async unsetToken(account: AccountDocument, kind: AccessTokenKind) {
        const token = await this.getToken(account, kind);

        // Revoke access at token provider if token has scopes
        if (token.scopes.length) {
            await this.revoke(token);
        }

        // Remove from storage
        return this.remove({ sub: account._id, kind });
    }

    static remove({ sub, kind }: { sub: string; kind: AccessTokenKind }) {
        return Token.findOneAndDelete({ sub, kind });
    }

    static findTokenForUserId(userId: string, kind: AccessTokenKind) {
        return Token.findOne({ userId, kind });
    }
}
