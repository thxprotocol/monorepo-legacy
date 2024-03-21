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
} from '@gala-chain/api';
import { ChainUser, ChainClient } from '@gala-chain/client';
import { instanceToPlain, plainToClass as plainToInstance } from 'class-transformer';
import { BigNumber } from 'bignumber.js';

const NETWORK_ROOT = '/Users/peterpolman/Sites/galachain';
const PRIVATE_KEY = '62172f65ecab45f423f7088128eee8946c5b3c03911cb0b061b1dd9032337271';

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
    RegisterEthUser(newUser: ChainUser): Promise<RegisterUserDto>;
}

interface CustomTokenAPI {
    ERC20BalanceOf({ owner }: { owner: ChainUser }): Promise<any>;
    ERC20Create({ name, symbol, decimals, maxSupply }: ERC20TokenCreate, privateKey: string): Promise<TokenClassKey>;
    ERC20Approve(options: { spender: ChainUser; amount: number }, privateKey: string): Promise<any>;
    ERC20Mint(options: { to: ChainUser; amount: number }, privateKey: string): Promise<TokenClassKey>;
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
        async RegisterEthUser(newUser: ChainUser) {
            const dto = new RegisterUserDto();
            dto.publicKey = newUser.publicKey;
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
        async ERC20BalanceOf({ owner }: { owner: ChainUser }) {
            const dto = await createValidDTO(FetchBalancesDto, {
                owner: owner.identityKey,
                ...instanceToPlain(erc20ClassKey),
            });
            const response = await client.evaluateTransaction('FetchBalances', dto, TokenBalance);
            return response.Data;
        },
        async ERC20Approve({ spender, amount }: { spender: ChainUser; amount: number }, privateKey: string) {
            const dto = await createValidDTO<GrantAllowanceDto>(GrantAllowanceDto, {
                tokenInstance: TokenInstanceKey.fungibleKey(erc20ClassKey).toQueryKey(),
                allowanceType: AllowanceType.Mint,
                quantities: [{ user: spender.identityKey, quantity: new BigNumber(amount) as any }],
                uses: new BigNumber(10) as any,
            });
            const galaResult = await client.submitTransaction<TokenAllowance[]>(
                'GrantAllowance',
                dto.signed(privateKey),
                TokenAllowance,
            );
            return galaResult;
        },
        async ERC20Mint({ to, amount }: { to: ChainUser; amount: number }, privateKey: string) {
            const dto = await createValidDTO<MintTokenDto>(MintTokenDto, {
                owner: to.identityKey,
                tokenClass: erc20ClassKey,
                quantity: new BigNumber(amount) as any,
            });
            const response = await client.submitTransaction('MintToken', dto.signed(privateKey), TokenClassKey);
            if (GalaChainResponse.isError(response)) {
                throw new Error(`Cannot Mint: ${response.Message} (${response.ErrorKey})`);
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
    };
}

function getAdminPrivateKey() {
    return PRIVATE_KEY;
}

export { NETWORK_ROOT, CustomAPI, CustomTokenAPI, getAdminPrivateKey, customAPI, customTokenAPI };
