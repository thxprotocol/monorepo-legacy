import { AccessTokenKind } from '@thxnetwork/common/lib/types';
import { Token, TokenDocument } from '../models/Token';
import { AccountDocument } from '../models/Account';
import { TwitterService } from './TwitterService';
import { YouTubeService } from './YouTubeService';
import { DiscordService } from './DiscordService';

const serviceMap = {
    [AccessTokenKind.Twitter]: TwitterService,
    [AccessTokenKind.YoutubeView]: YouTubeService,
    [AccessTokenKind.YoutubeManage]: YouTubeService,
    [AccessTokenKind.Discord]: DiscordService,
    [AccessTokenKind.DiscordServers]: DiscordService,
};

async function isAuthorized(account: AccountDocument, kind: AccessTokenKind) {
    return await serviceMap[kind].isAuthorized(account);
}

async function getToken(account: AccountDocument, kind: AccessTokenKind): Promise<TokenDocument> {
    return await Token.findOne({ sub: account._id, kind });
}

async function setToken(account: AccountDocument, token: Partial<TokenDocument>) {
    return await Token.findOneAndUpdate(
        { sub: account._id, kind: token.kind },
        { ...token, sub: account._id },
        { upsert: true, new: true },
    );
}

async function unsetToken(account: AccountDocument, kind: AccessTokenKind) {
    return await Token.findOneAndDelete({ sub: account._id, kind });
}

async function list(account: AccountDocument) {
    return await Token.find({ sub: account._id });
}

async function findTokenForUserId(userId: string, kind: AccessTokenKind) {
    return await Token.findOne({ userId, kind });
}

async function isConnected(sub: string, userId: string, kind: AccessTokenKind) {
    return !!(await Token.exists({ sub, userId, kind }));
}

export default { getToken, setToken, unsetToken, isAuthorized, list, findTokenForUserId, isConnected };
