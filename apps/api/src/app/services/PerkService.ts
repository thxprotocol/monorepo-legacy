import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
import { TTokenGating } from '@thxnetwork/types/index';
import { getContractFromName } from '../config/contracts';
import { fromWei } from 'web3-utils';
import { logger } from '../util/logger';
import { alchemy } from '../util/alchemy';
import { WalletDocument } from '../models/Wallet';
import { ERC20PerkDocument } from '../models/ERC20Perk';
import { ERC721PerkDocument } from '../models/ERC721Perk';
import { ShopifyPerkDocument } from '../models/ShopifyPerk';
import WalletService from './WalletService';
import { AssetPoolDocument } from '../models/AssetPool';

type TAllPerks = ERC20PerkDocument | ERC721PerkDocument | ShopifyPerkDocument;

export async function verifyOwnership(tokenGating: TTokenGating, wallet: WalletDocument): Promise<boolean> {
    const walletAddres = wallet.address;
    const { variant, contractAddress, amount } = tokenGating;

    switch (variant) {
        case TokenGatingVariant.ERC20: {
            try {
                const tokenAmount = amount !== undefined ? amount : 0;
                const contract = getContractFromName(wallet.chainId, 'LimitedSupplyToken', contractAddress);
                const balance = Number(fromWei(await contract.methods.balanceOf(walletAddres).call(), 'ether'));
                return balance >= tokenAmount;
            } catch (err) {
                logger.error(err);
                return false;
            }
        }
        default: {
            try {
                const result = await alchemy.nft.getNftsForOwner(walletAddres, {
                    contractAddresses: [contractAddress],
                    omitMetadata: true,
                });
                const totalCount = Number(result.totalCount);
                return totalCount > 0;
            } catch (err) {
                logger.error(err);
                return false;
            }
        }
    }
}

export async function getIsLockedFoWallet(perk: ERC20PerkDocument | ERC721PerkDocument, userWallet: WalletDocument) {
    if (!userWallet || !perk.tokenGating) {
        return false;
    }
    const isOwned = await verifyOwnership(perk.tokenGating, userWallet);
    return !isOwned;
}

export async function getIsLockedFoSub(
    perk: ERC20PerkDocument | ERC721PerkDocument,
    sub: string,
    pool: AssetPoolDocument,
) {
    const wallets = await WalletService.findByQuery({ sub, chainId: pool.chainId });
    const userWallet = wallets[0];
    if (!userWallet || !perk.tokenGating) {
        return false;
    }
    const isOwned = await verifyOwnership(perk.tokenGating, userWallet);
    return !isOwned;
}

async function getProgress(r: TAllPerks, model: any) {
    return {
        count: await model.countDocuments({ perkId: r._id }),
        limit: r.limit,
    };
}

async function getExpiry(r: TAllPerks) {
    return {
        now: Date.now(),
        date: new Date(r.expiryDate).getTime(),
    };
}

export default { verifyOwnership, getIsLockedFoWallet, getExpiry, getProgress, getIsLockedFoSub };
