import { ethers } from 'ethers';
import { plainToInstance } from 'class-transformer';
import { TokenClassKey, AllowanceType } from '@gala-chain/api';
import { GalachainContract, getContract } from '@thxnetwork/api/util/galachain';
import BigNumber from 'bignumber.js';
import GalachainService from '@thxnetwork/api/services/GalachainService';

const PRIVATE_KEY_ADMIN = '62172f65ecab45f423f7088128eee8946c5b3c03911cb0b061b1dd9032337271';
const PRIVATE_KEY_DISTRIBUTOR = '1ff36b62099c5c82d2b5606fdea70dc9f8e87676eb7958cf3b765358ee8b7051';
const PRIVATE_KEY_USER = '97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9';

export default async function main() {
    const nftClassKey = {
        collection: 'Weapons',
        category: 'Blades',
        type: 'none',
        additionalKey: 'none',
        instance: new BigNumber(1),
    };
    // Define coin class key
    const tokenInfo = {
        decimals: 0,
        tokenClass: nftClassKey,
        name: 'Sting',
        symbol: 'Sting',
        description: 'This collection holds weapons of any sort!',
        image: 'https://pbs.twimg.com/profile_images/1640708099177877505/4U-ya--t_400x400.jpg',
        isNonFungible: true,
        maxSupply: new BigNumber(100),
    };
    const profileContract = getContract(GalachainContract.PublicKeyContract);
    const tokenContract = getContract(GalachainContract.GalaChainToken);

    // Generate random wallet
    const walletAdmin = new ethers.Wallet(PRIVATE_KEY_ADMIN);
    console.log({ walletAdmin });

    const walletDistributor = new ethers.Wallet(PRIVATE_KEY_DISTRIBUTOR);
    console.log({ walletDistributor });

    const walletUser = new ethers.Wallet(PRIVATE_KEY_USER);
    console.log({ walletUser });

    // Register user
    // const user = await GalachainService.registerUser(profileContract, walletUser.publicKey, PRIVATE_KEY_ADMIN);
    // console.log(user);

    // Get profile for user
    const profile = await GalachainService.getProfile(profileContract, PRIVATE_KEY_USER);
    console.log(profile);

    // Admin creates a token
    // const nft = await GalachainService.Create(tokenContract, tokenInfo, nftClassKey, PRIVATE_KEY_ADMIN);
    // console.log(nft);

    // Approve total supply token transfers for admin
    // const result = await GalachainService.Approve(
    //     tokenContract,
    //     nftClassKey,
    //     walletDistributor.address,
    //     100,
    //     AllowanceType.Mint,
    //     PRIVATE_KEY_ADMIN,
    // );
    // console.log(result);

    // Distributor mints 1 token
    await GalachainService.Mint(tokenContract, nftClassKey, walletDistributor.address, 5, PRIVATE_KEY_DISTRIBUTOR);

    // Get balance of tokens for distributor
    const balances = (await GalachainService.BalanceOf(tokenContract, nftClassKey, PRIVATE_KEY_DISTRIBUTOR)) as {
        quantity: number;
    }[];
    console.log(balances);

    // // Transfer from distributor to wallet address
    // await GalachainService.Transfer(
    //     tokenContract,
    //     nftClassKey,
    //     walletUser.address,
    //     1,
    //     PRIVATE_KEY_DISTRIBUTOR,
    // );

    // Balance of the user
    const [balanceUser] = (await GalachainService.BalanceOf(tokenContract, nftClassKey, PRIVATE_KEY_USER)) as {
        quantity: number;
    }[];
    console.log(balanceUser);
}
