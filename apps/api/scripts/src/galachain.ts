import path from 'path';
import { RestApiClientConfig, gcclient } from '@gala-chain/client';
import { customAPI, customTokenAPI, getAdminPrivateKey, NETWORK_ROOT, PRIVATE_KEY_DISTRIBUTOR } from './utils/gala';
import { BigNumber } from 'bignumber.js';
import { ethers } from 'ethers';

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
    // const tokenDistributor = ChainUser.withRandomKeys();
    // console.log(tokenDistributor.privateKey);

    // Register token distributor
    // Get profile for token distributor
    const publicKey = new ethers.Wallet(PRIVATE_KEY_DISTRIBUTOR).publicKey;
    const tokenDistributor = await client.RegisterEthUser(publicKey);
    const tokenDistributorProfile = await client.GetProfile(PRIVATE_KEY_DISTRIBUTOR);
    console.log({ tokenDistributorProfile });

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
    // await tokenClient.ERC20Approve(
    //     {
    //         spender: tokenDistributorProfile.alias,
    //         amount: 100000000,
    //     },
    //     adminPrivateKey,
    // );

    // // Mint
    // await tokenClient.ERC20Mint(
    //     {
    //         to: tokenDistributorProfile.alias,
    //         amount: 100000000,
    //     },
    //     adminPrivateKey,
    // );

    // Get Balance
    const [balance] = await tokenClient.ERC20BalanceOf({ owner: tokenDistributorProfile.alias });
    console.log(new BigNumber(balance.quantity).toNumber());
}
