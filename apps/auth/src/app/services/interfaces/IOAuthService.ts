import { OAuthScope } from '@thxnetwork/common/lib/types';
import { TokenDocument } from '../../models/Token';

export interface IOAuthService {
    getLoginURL(options: { uid: string; scope: OAuthScope }): string;
    requestToken(code: string): Promise<Partial<TokenDocument>>;
    refreshToken(token: TokenDocument): Promise<TokenDocument>;
    revokeToken(token: TokenDocument): Promise<void>;
}
