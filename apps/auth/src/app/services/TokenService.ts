import { AccessTokenKind, IAccessToken } from '@thxnetwork/common/lib/types';
import { Token } from '../models/Token';
import { AccountDocument } from '../models/Account';

async function getToken(account: AccountDocument, kind: AccessTokenKind): Promise<IAccessToken> {
    return await Token.findOne({ sub: account._id, kind });
}

async function setToken(account: AccountDocument, token: IAccessToken) {
    return await Token.findOneAndUpdate({ sub: account._id, kind: token.kind }, token, { upsert: true });
}

async function unsetToken(account: AccountDocument, kind: AccessTokenKind) {
    return await Token.findOneAndDelete({ sub: account._id, kind });
}

export { getToken, setToken, unsetToken };
