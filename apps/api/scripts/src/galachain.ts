import path from 'path';
import { ChainUser, RestApiClientConfig, gcclient } from '@gala-chain/client';
import { customAPI, customTokenAPI, getAdminPrivateKey, NETWORK_ROOT } from './utils/gala';
import { BigNumber } from 'bignumber.js';
import axios from 'axios';
import { MaxUint256 } from '@thxnetwork/api/util/network';

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

    // Create a token distributor
    const tokenDistributor = ChainUser.withRandomKeys();
    console.log(tokenDistributor.privateKey);

    // Register token distributor
    await client.RegisterEthUser(tokenDistributor);

    // Get profile for token distributor
    const tokenDistributorProfile = await client.GetProfile(tokenDistributor.privateKey);
    console.log({ tokenDistributor });

    // Deploy a Coin
    // const coin = await tokenClient.ERC20Create(
    //     {
    //         image: 'https://thx.network',
    //         name: 'THX Network',
    //         description: 'THX Network Coin',
    //         symbol: 'THX',
    //         decimals: 18,
    //         maxSupply: 100000000,
    //     },
    //     adminPrivateKey,
    // );
    // console.log(coin);

    // Approve
    await tokenClient.ERC20Approve(
        {
            spender: tokenDistributor,
            amount: 100000000,
        },
        adminPrivateKey,
    );

    // Mint
    await tokenClient.ERC20Mint(
        {
            to: tokenDistributor,
            amount: 100000000,
        },
        tokenDistributor.privateKey,
    );

    // Get Balance
    const [balance] = await tokenClient.ERC20BalanceOf({ owner: tokenDistributor });
    console.log(new BigNumber(balance.quantity).toNumber());
}
