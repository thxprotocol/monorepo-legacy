import {
    TokenClassKey,
    TokenInstanceKey,
    createValidDTO,
    CreateTokenClassDto,
    RegisterUserDto,
    GalaChainResponse,
    GetMyProfileDto,
    MintTokenDto,
    GrantAllowanceDto,
    UserProfile,
    AllowanceType,
    TokenAllowance,
    TokenBalance,
    FetchBalancesDto,
    TransferTokenDto,
} from '@gala-chain/api';
import { ChainUser, ChainClient } from '@gala-chain/client';
import { instanceToPlain, plainToClass as plainToInstance } from 'class-transformer';
import { BigNumber } from 'bignumber.js';

const NETWORK_ROOT = '/Users/peterpolman/Sites/galachain';
const PRIVATE_KEY = '62172f65ecab45f423f7088128eee8946c5b3c03911cb0b061b1dd9032337271';
const PRIVATE_KEY_DISTRIBUTOR = '1ff36b62099c5c82d2b5606fdea70dc9f8e87676eb7958cf3b765358ee8b7051';

type ERC20TokenCreate = {
    image: string;
    name: string;
    description: string;
    symbol: string;
    decimals: number;
    maxSupply: number;
};

type ERC721TokenCreate = {
    name: string;
    description: string;
    image: string;
    symbol: string;
    tokenClass: Partial<TokenClassKey>;
};

interface CustomAPI {
    GetProfile(privateKey: string): Promise<UserProfile>;
    RegisterEthUser(publicKey: string): Promise<RegisterUserDto>;
}

interface CustomTokenAPI {
    ERC20BalanceOf({ owner }: { owner: string }): Promise<any>;
    ERC20Create({ name, symbol, decimals, maxSupply }: ERC20TokenCreate, privateKey: string): Promise<TokenClassKey>;
    ERC20Approve(options: { spender: string; amount: number }, privateKey: string): Promise<any>;
    ERC20Mint(options: { to: string; amount: number }, privateKey: string): Promise<TokenClassKey>;
    ERC20Transfer(options: { to: string; amount: number }, privateKey: string): Promise<any>;
    ERC721Create({ name, description, image }: ERC721TokenCreate, privateKey: string): Promise<TokenClassKey>;
}

function customAPI(client: ChainClient): CustomAPI {
    return {
        async GetProfile(privateKey: string) {
            const dto = new GetMyProfileDto().signed(privateKey, false);
            const response = await client.evaluateTransaction('GetMyProfile', dto, UserProfile);
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot get profile: ${response.Message} (${response.ErrorKey})`);
            } else {
                return response.Data as UserProfile;
            }
        },
        async RegisterEthUser(publicKey: string) {
            const dto = new RegisterUserDto();
            dto.publicKey = publicKey;
            dto.sign(getAdminPrivateKey(), false);

            const response = await client.submitTransaction('RegisterEthUser', dto, RegisterUserDto);
            return response.Data;
        },
    };
}

const erc20ClassKey: TokenClassKey = plainToInstance(TokenClassKey, {
    collection: 'Currencies',
    category: 'Coins',
    type: 'none',
    additionalKey: 'none',
    instance: 0,
});

function customTokenAPI(client: ChainClient): CustomTokenAPI {
    return {
        async ERC20Create(
            { image, name, description, symbol, decimals, maxSupply }: ERC20TokenCreate,
            privateKey: string,
        ) {
            const tokenDto: CreateTokenClassDto = await createValidDTO<CreateTokenClassDto>(CreateTokenClassDto, {
                tokenClass: erc20ClassKey,
                name,
                symbol,
                decimals,
                description,
                image,
                maxSupply: new BigNumber(maxSupply) as any,
                isNonFungible: false,
            });
            const response = await client.submitTransaction<TokenClassKey>(
                'CreateTokenClass',
                tokenDto.signed(privateKey),
                TokenClassKey,
            );
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot Create ERC20: ${response.Message} (${response.ErrorKey})`);
            } else {
                return response.Data;
            }
        },
        async ERC20BalanceOf({ owner }: { owner: string }) {
            const dto = await createValidDTO(FetchBalancesDto, {
                owner,
                ...instanceToPlain(erc20ClassKey),
            });
            const response = await client.evaluateTransaction('FetchBalances', dto, TokenBalance);
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot Fetch ERC20 Balances: ${response.Message} (${response.ErrorKey})`);
            } else {
                return response.Data;
            }
        },
        async ERC20Approve({ spender, amount }: { spender; amount: number }, privateKey: string) {
            const dto = await createValidDTO<GrantAllowanceDto>(GrantAllowanceDto, {
                tokenInstance: TokenInstanceKey.fungibleKey(erc20ClassKey).toQueryKey(),
                allowanceType: AllowanceType.Mint,
                quantities: [{ user: spender, quantity: new BigNumber(amount) as any }],
                uses: new BigNumber(10) as any,
            });
            const response = await client.submitTransaction<TokenAllowance[]>(
                'GrantAllowance',
                dto.signed(privateKey),
                TokenAllowance,
            );
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot Approve ERC20 Transfer: ${response.Message} (${response.ErrorKey})`);
            } else {
                return response.Data;
            }
        },
        async ERC20Mint({ to, amount }: { to; amount: number }, privateKey: string) {
            const dto = await createValidDTO<MintTokenDto>(MintTokenDto, {
                owner: to,
                tokenClass: erc20ClassKey,
                quantity: new BigNumber(amount) as any,
            });
            const response = await client.submitTransaction('MintToken', dto.signed(privateKey), TokenClassKey);
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot Mint ERC20: ${response.Message} (${response.ErrorKey})`);
            } else {
                return response.Data;
            }
        },
        async ERC721Create({ image, name, description, symbol, tokenClass }: ERC721TokenCreate, privateKey: string) {
            const nftClassKey: TokenClassKey = plainToInstance(TokenClassKey, {
                ...tokenClass,
                additionalKey: 'none',
            });
            const tokenDto: CreateTokenClassDto = await createValidDTO<CreateTokenClassDto>(CreateTokenClassDto, {
                tokenClass: nftClassKey,
                name,
                symbol,
                description,
                image,
                decimals: 0,
                isNonFungible: true,
            });
            const response = await client.submitTransaction<TokenClassKey>(
                'CreateTokenClass',
                tokenDto.signed(privateKey),
                TokenClassKey,
            );
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot Create ERC721: ${response.Message} (${response.ErrorKey})`);
            } else {
                return response.Data;
            }
        },
        async ERC20Transfer(options: { to; amount: number }, privateKey: string) {
            const tokenInstance = plainToInstance(TokenInstanceKey, {
                ...erc20ClassKey,
                instance: new BigNumber(0),
            });
            const dto = await createValidDTO<TransferTokenDto>(TransferTokenDto, {
                to: options.to,
                tokenInstance,
                quantity: new BigNumber(options.amount) as any,
            });
            const response = await client.submitTransaction('TransferToken', dto.signed(privateKey));
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot Create ERC20 Transfer: ${response.Message} (${response.ErrorKey})`);
            } else {
                return response.Data;
            }
        },
    };
}

function getAdminPrivateKey() {
    return PRIVATE_KEY;
}

export {
    PRIVATE_KEY_DISTRIBUTOR,
    NETWORK_ROOT,
    CustomAPI,
    CustomTokenAPI,
    getAdminPrivateKey,
    customAPI,
    customTokenAPI,
};
