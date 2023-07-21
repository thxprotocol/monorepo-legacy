import { currentVersion } from '@thxnetwork/contracts/exports';
import { contractNetworks } from '@thxnetwork/api/config/contracts';
import { Wallet as WalletModel, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ChainId } from '@thxnetwork/types/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { updateDiamondContract } from '@thxnetwork/api/util/upgrades';
import { toChecksumAddress } from 'web3-utils';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import { SafeTransaction, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';

export const Wallet = WalletModel;

function getSafeSDK(chainId: ChainId) {
    const { txServiceUrl, ethAdapter } = getProvider(chainId);
    return new SafeApiKit({ txServiceUrl, ethAdapter });
}

async function create(data: { chainId: ChainId; sub: string; address?: string }, userWalletAddress: string) {
    const { chainId, sub, address } = data;
    const wallet = await Wallet.create({ sub, chainId, address });
    if (address) return wallet;

    const { defaultAccount, ethAdapter } = getProvider(wallet.chainId);
    const safeFactory = await SafeFactory.create({
        safeVersion: '1.3.0',
        contractNetworks,
        ethAdapter,
    });
    const safeAccountConfig: SafeAccountConfig = {
        owners: [toChecksumAddress(defaultAccount), toChecksumAddress(userWalletAddress)],
        threshold: 2,
    };
    const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig);
    safeFactory.deploySafe({ safeAccountConfig, options: { gasLimit: '30000000' } });

    return await Wallet.findByIdAndUpdate(wallet._id, { address: safeAddress, version: currentVersion }, { new: true });
}

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

async function createTransaction(wallet: WalletDocument, safeAddress: string, to: string, amountInWei: string) {
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({ ethAdapter, safeAddress: wallet.address, contractNetworks });
    const safeTransactionData: SafeTransactionDataPartial = {
        to,
        data: '0x',
        value: amountInWei,
        safeTxGas: 5000000,
    };

    return await safeSdk.createTransaction({ safeTransactionData });
}

async function proposeTransaction(wallet: WalletDocument, safeTransaction: SafeTransaction) {
    const { ethAdapter, signer } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({ ethAdapter, safeAddress: wallet.address, contractNetworks });
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
    const safeSDK = getSafeSDK(wallet.chainId);

    await safeSDK.proposeTransaction({
        safeAddress: wallet.address,
        safeTxHash,
        safeTransactionData: safeTransaction.data as any,
        senderAddress: toChecksumAddress(await signer.getAddress()),
        senderSignature: senderSignature.data,
    });
}

async function confirmTransaction(wallet: WalletDocument, safeTxHash: string) {
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeSdkOwner = await Safe.create({ ethAdapter, safeAddress: wallet.address, contractNetworks });
    const signature = await safeSdkOwner.signTransactionHash(safeTxHash);
    const safeService = getSafeSDK(wallet.chainId);

    return await safeService.confirmTransaction(safeTxHash, signature.data);
}

async function executeTransactionSafe(wallet: WalletDocument, safeTxHash: string) {
    const { ethAdapter, signer } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({ ethAdapter, safeAddress: wallet.address, contractNetworks });
    const safeService = getSafeSDK(wallet.chainId);
    const safeTransaction = await safeService.getTransaction(safeTxHash);
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction as any, {
        from: await signer.getAddress(),
    });

    return await executeTxResponse.transactionResponse?.wait();
}

async function getLastPendingTransactions(wallet: WalletDocument) {
    const safeService = getSafeSDK(wallet.chainId);
    const { results }: any = await safeService.getPendingTransactions(toChecksumAddress(wallet.address));
    return results;
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
    createTransaction,
    proposeTransaction,
    confirmTransaction,
    executeTransactionSafe,
    getLastPendingTransactions,
    transferOwnership,
    findPrimary,
    upgrade,
    create,
    findOneByAddress,
    findByQuery,
    findOneByQuery,
};
