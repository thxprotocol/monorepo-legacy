import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
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

export async function verifyOwnership(perk: TAllPerks, wallet: WalletDocument): Promise<boolean> {
    const { tokenGatingVariant, tokenGatingContractAddress, tokenGatingAmount } = perk;

    switch (tokenGatingVariant) {
        case TokenGatingVariant.ERC20: {
            const contract = getContractFromName(wallet.chainId, 'LimitedSupplyToken', tokenGatingContractAddress);
            const balance = Number(fromWei(await contract.methods.balanceOf(wallet.address).call(), 'ether'));

            return balance >= tokenGatingAmount;
        }
        case TokenGatingVariant.ERC721:
        case TokenGatingVariant.ERC1155: {
            try {
                const result = await alchemy.nft.getNftsForOwner(wallet.address, {
                    contractAddresses: [tokenGatingContractAddress],
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

export async function getIsLockedForWallet(perk: TAllPerks, userWallet: WalletDocument) {
    const isOwned = await verifyOwnership(perk, userWallet);
    return !isOwned;
}

export async function getIsLockedForSub(perk: TAllPerks, sub: string, pool: AssetPoolDocument) {
    const wallet = await WalletService.findOneByQuery({ sub, chainId: pool.chainId });
    if (!wallet) return true;

    const isOwned = await verifyOwnership(perk, wallet);
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

export default { verifyOwnership, getIsLockedForWallet, getExpiry, getProgress, getIsLockedForSub };
