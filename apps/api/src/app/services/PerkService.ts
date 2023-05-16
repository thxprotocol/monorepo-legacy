import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
import { getContractFromName } from '../config/contracts';
import { fromWei } from 'web3-utils';
import { WalletDocument } from '../models/Wallet';
import { ERC20PerkDocument } from '../models/ERC20Perk';
import { ERC721PerkDocument } from '../models/ERC721Perk';
import { ShopifyPerkDocument } from '../models/ShopifyPerk';
import WalletService from './WalletService';
import { AssetPoolDocument } from '../models/AssetPool';

type TAllPerks = ERC20PerkDocument | ERC721PerkDocument | ShopifyPerkDocument;

export async function verifyOwnership(
    { tokenGatingVariant, tokenGatingContractAddress, tokenGatingAmount }: TAllPerks,
    wallet: WalletDocument,
): Promise<boolean> {
    switch (tokenGatingVariant) {
        case TokenGatingVariant.ERC20: {
            const contract = getContractFromName(wallet.chainId, 'LimitedSupplyToken', tokenGatingContractAddress);
            const balance = Number(fromWei(await contract.methods.balanceOf(wallet.address).call(), 'ether'));

            return balance >= tokenGatingAmount;
        }
        case TokenGatingVariant.ERC721: {
            const contract = getContractFromName(wallet.chainId, 'NonFungibleToken', tokenGatingContractAddress);
            const balance = Number(await contract.methods.balanceOf(wallet.address).call());

            return !!balance;
        }
        case TokenGatingVariant.ERC1155: {
            const contract = getContractFromName(wallet.chainId, 'THX_ERC1155', tokenGatingContractAddress);
            const balance = Number(await contract.methods.balanceOf(wallet.address).call());
            return !!balance;
        }
    }
}

export async function getIsLockedForWallet(perk: TAllPerks, wallet: WalletDocument) {
    if (!perk.tokenGatingContractAddress || !wallet) return;
    const isOwned = await verifyOwnership(perk, wallet);
    return !isOwned;
}

export async function getIsLockedForSub(perk: TAllPerks, sub: string, pool: AssetPoolDocument) {
    if (!perk.tokenGatingContractAddress) return;
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
