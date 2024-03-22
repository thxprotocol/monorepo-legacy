import { TokenInstanceKey, TokenClassKey, RegisterUserDto, UserProfile } from '@gala-chain/api';

interface CustomProfileAPI {
    GetProfile(privateKey: string): Promise<UserProfile>;
    RegisterEthUser(publicKey: string): Promise<RegisterUserDto>;
}

interface CustomTokenAPI {
    CoinBalanceOf({ tokenInstance, owner }: { tokenInstance: TokenInstanceKey; owner: string }): Promise<any>;
    CoinCreate(
        tokenInfo: {
            image: string;
            name: string;
            description: string;
            symbol: string;
            decimals: number;
            maxSupply: any;
        },
        privateKey: string,
    ): Promise<TokenClassKey>;
    CoinApprove(options: { spender: string; amount: number }, privateKey: string): Promise<any>;
    CoinMint(options: { to: string; amount: number }, privateKey: string): Promise<TokenClassKey>;
    CoinTransfer(options: { to: string; amount: number }, privateKey: string): Promise<any>;
}

export { CustomProfileAPI, CustomTokenAPI };
