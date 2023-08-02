import { Wallet as WalletModel, WalletDocument } from '../models/Wallet';
import { ChainId } from '@thxnetwork/types/enums';
import { updateDiamondContract } from '../util/upgrades';
import { toChecksumAddress } from 'web3-utils';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';

export const Wallet = WalletModel;

function findOneByAddress(address: string) {
    return Wallet.findOne({ address: toChecksumAddress(address) });
}

async function findPrimary(sub: string, chainId: ChainId) {
    return await Wallet.findOne({ sub, chainId, address: { $exists: true, $ne: '' } });
}

async function findOneByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.findOne(query);
}

async function findByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.find(query);
}

async function upgrade(wallet: WalletDocument, version?: string) {
    const tx = await updateDiamondContract(wallet.chainId, wallet.contract, 'sharedWallet', version);

    if (tx) {
        wallet.version = version;
        await wallet.save();
    }

    return tx;
}

async function transferOwnership(wallet: WalletDocument, primaryWallet: WalletDocument) {
    // If found update all milestone reward claims for that walletId
    await MilestoneRewardClaim.updateMany(
        { walletId: String(wallet._id), isClaimed: false },
        { walletId: String(primaryWallet._id) },
    );

    return await Wallet.findByIdAndUpdate(wallet._id, { sub: primaryWallet.sub }, { new: true });
}

export default {
    transferOwnership,
    findPrimary,
    upgrade,
    findOneByAddress,
    findByQuery,
    findOneByQuery,
};
