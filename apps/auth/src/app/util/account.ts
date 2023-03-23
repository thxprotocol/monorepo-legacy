import { AccessTokenKind } from '@thxnetwork/types/index';
import { Account } from '../models/Account';
import { ForbiddenError } from './errors';

export const checkAccountAlreadyConnected = async (userId: string, tokenKind: AccessTokenKind) => {
    const id = await Account.exists({ 'tokens.kind': tokenKind, 'tokens.userId': userId });
    if (id != null) {
        throw new ForbiddenError('This account is already connected to a different user.');
    }
};
