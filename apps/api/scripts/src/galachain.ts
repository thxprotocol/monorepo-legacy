import { ethers } from 'ethers';
import { AllowanceType } from '@gala-chain/api';
import { GalachainContract, getContract } from '@thxnetwork/api/util/galachain';
import BigNumber from 'bignumber.js';
import GalachainService from '@thxnetwork/api/services/GalachainService';

const PRIVATE_KEY_ADMIN = '62172f65ecab45f423f7088128eee8946c5b3c03911cb0b061b1dd9032337271';
const PRIVATE_KEY_DISTRIBUTOR = '096b2543a26e164e5f8887c737fe31d04734abe657416eacf0b5a52e6c5fa684';
const PRIVATE_KEY_USER = '97093724e1748ebfa6aa2d2ec4ec68df8678423ab9a12eb2d27ddc74e35e5db9';

export default async function main() {
    const nftClassKey = {
        collection: 'Weapons',
        category: 'Blades',
        type: 'none',
        additionalKey: 'none',
    };
    // Define coin class key
    const tokenInfo = {
        decimals: 0,
        tokenClass: nftClassKey,
        name: 'Sting',
        symbol: 'WBSting',
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

    // Register distributor
    const distributor = await GalachainService.registerUser(
        profileContract,
        walletDistributor.publicKey,
        PRIVATE_KEY_ADMIN,
    );
    console.log(distributor);

    // Register user
    const user = await GalachainService.registerUser(profileContract, walletUser.publicKey, PRIVATE_KEY_ADMIN);
    console.log(user);

    // Admin creates an NFT
    const nft = await GalachainService.create(tokenContract, tokenInfo, nftClassKey, PRIVATE_KEY_ADMIN);
    console.log(nft);

    // Approve minting of maxsupply for admin
    const result = await GalachainService.approve(
        tokenContract,
        nftClassKey,
        walletDistributor.address,
        100,
        AllowanceType.Mint,
        PRIVATE_KEY_ADMIN,
    );
    console.log(result);

    // Distributor mints 5 tokens
    await GalachainService.mint(tokenContract, nftClassKey, walletDistributor.address, 5, PRIVATE_KEY_DISTRIBUTOR);

    // Get balance of tokens for distributor
    const balances = (await GalachainService.balanceOf(tokenContract, nftClassKey, PRIVATE_KEY_DISTRIBUTOR)) as {
        quantity: number;
    }[];
    console.log(balances);

    // Balance of the user
    const [balanceUser] = (await GalachainService.balanceOf(tokenContract, nftClassKey, PRIVATE_KEY_USER)) as {
        quantity: number;
    }[];
    console.log(balanceUser);
}
