import path from 'path';
import { ChainUser, RestApiClientConfig, gcclient } from '@gala-chain/client';
import { customAPI, customTokenAPI, getAdminPrivateKey, NETWORK_ROOT } from './utils/gala';
import { BigNumber } from 'bignumber.js';

const adminPrivateKey = getAdminPrivateKey();

// Client Config
const params: RestApiClientConfig = {
    orgMsp: 'CuratorOrg',
    userId: 'admin',
    userSecret: 'adminpw',
    apiUrl: 'http://localhost:8801',
    configPath: path.resolve(NETWORK_ROOT, 'api-config.json'),
};

// Contract and channel defaults
const contract = {
    channelName: 'product-channel',
    chaincodeName: 'basic-product',
};

// Client for user management
const client = gcclient
    .forApiConfig(params)
    .forContract({ ...contract, contractName: 'PublicKeyContract' })
    .extendAPI(customAPI);

// Client for token management
const tokenClient = gcclient
    .forApiConfig(params)
    .forContract({ ...contract, contractName: 'GalaChainToken' })
    .extendAPI(customTokenAPI);

export default async function main() {
    // Get admin profile
    const adminProfile = await client.GetProfile(adminPrivateKey);
    console.log(adminProfile);

    // Create a new user
    const newUser = ChainUser.withRandomKeys();

    // Register the user
    await client.RegisterEthUser(newUser);

    // Get profile for the user
    const newUserProfile = await client.GetProfile(newUser.privateKey);
    console.log(newUserProfile);

    // Deploy a Coin
    const coin = await tokenClient.ERC20Create(
        {
            image: 'https://thx.network',
            name: 'THX Network',
            description: 'THX Network Coin',
            symbol: 'THX',
            decimals: 18,
            maxSupply: 100000000,
        },
        adminPrivateKey,
    );
    console.log(coin);

    // Approve
    await tokenClient.ERC20Approve(
        {
            spender: newUser,
            amount: 100,
        },
        adminPrivateKey,
    );

    // Mint
    await tokenClient.ERC20Mint(
        {
            to: newUser,
            amount: 100,
        },
        newUser.privateKey,
    );

    // Get Balance
    const [balance] = await tokenClient.ERC20BalanceOf({ owner: newUser });
    console.log(new BigNumber(balance.quantity).toNumber());

    // Deploy an NFT
    const nft = await tokenClient.ERC721Create(
        {
            name: 'THX Network',
            description: 'THX Network NFT',
            symbol: 'THXNFT',
            image: 'https://thx.network',
            tokenClass: {
                collection: 'Items',
                category: 'Weapons',
                type: 'Axe',
            },
        },
        adminPrivateKey,
    );
    console.log(nft);
}
