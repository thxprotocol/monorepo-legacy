import { TokenDocument } from '../../models/Token';

export interface IOAuthService {
    getLoginURL(options: { uid: string; scope: string }): string;
    requestToken(code: string): Promise<Partial<TokenDocument>>;
    refreshToken(token: TokenDocument): Promise<TokenDocument>;
    revokeToken(token: TokenDocument): Promise<void>;
}
