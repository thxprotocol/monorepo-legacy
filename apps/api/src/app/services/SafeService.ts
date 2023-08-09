import { Wallet as WalletModel, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ChainId } from '@thxnetwork/types/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { contractNetworks } from '@thxnetwork/api/config/contracts';
import { toChecksumAddress } from 'web3-utils';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import {
    SafeMultisigTransactionResponse,
    SafeTransactionDataPartial,
    SafeVersion,
} from '@safe-global/safe-core-sdk-types';
import { logger } from '@thxnetwork/api/util/logger';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import AccountProxy from '../proxies/AccountProxy';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import { Claim } from '@thxnetwork/api/models/Claim';
import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import ERC20Transfer from '@thxnetwork/api/models/ERC20Transfer';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import ERC721Transfer from '@thxnetwork/api/models/ERC721Transfer';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { Withdrawal } from '@thxnetwork/api/models/Withdrawal';

export const Wallet = WalletModel;

function getSafeSDK(chainId: ChainId) {
    const { txServiceUrl, ethAdapter } = getProvider(chainId);
    return new SafeApiKit({ txServiceUrl, ethAdapter });
}

async function create(
    data: { chainId: ChainId; sub: string; safeVersion?: SafeVersion; address?: string },
    userWalletAddress?: string,
) {
    const { safeVersion, chainId, sub, address } = data;
    const wallet = await Wallet.create({ sub, chainId, address, safeVersion });
    // Concerns a Metamask account so we do not deploy and return early
    if (!safeVersion && address) return wallet;

    const { defaultAccount, ethAdapter } = getProvider(wallet.chainId);
    const safeFactory = await SafeFactory.create({
        safeVersion,
        ethAdapter,
        contractNetworks,
    });
    const safeAccountConfig: SafeAccountConfig = {
        owners: [toChecksumAddress(defaultAccount), toChecksumAddress(userWalletAddress)],
        threshold: 2,
    };
    const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig);

    try {
        await Safe.create({
            ethAdapter,
            safeAddress,
            contractNetworks,
        });
    } catch (error) {
        safeFactory
            .deploySafe({ safeAccountConfig, options: { gasLimit: '3000000' } })
            .then(() => logger.debug(`[${sub}] Deployed Safe:`, safeAddress))
            .catch(console.error);
    }

    return await Wallet.findByIdAndUpdate(wallet._id, { address: safeAddress }, { new: true });
}

async function getWalletMigration(sub: string, chainId: ChainId) {
    return await Wallet.findOne({
        sub,
        chainId,
        version: '4.0.12',
        address: { $exists: true, $ne: '' },
        safeVersion: { $exists: false },
    });
}

async function migrate(safeWallet: WalletDocument) {
    const thxWallet = await Wallet.findOne({
        sub: safeWallet.sub,
        chainId: safeWallet.chainId,
        version: '4.0.12',
        address: { $exists: true, $ne: '' },
        safeVersion: { $exists: false },
    });
    if (!thxWallet || !safeWallet) return;
    for (const model of [
        Claim,
        DailyRewardClaim,
        ERC20PerkPayment,
        ERC20Token,
        ERC20Transfer,
        ERC721PerkPayment,
        ERC721Token,
        ERC721Transfer,
        ERC1155Token,
        MilestoneRewardClaim,
        PointBalance,
        PointRewardClaim,
        PoolSubscription,
        ReferralRewardClaim,
        Withdrawal,
    ]) {
        await model.updateMany({ walletId: String(thxWallet._id) }, { walletId: String(safeWallet._id) });
    }
}

function findOneByAddress(address: string) {
    return Wallet.findOne({ address: toChecksumAddress(address) });
}

async function findPrimary(sub: string, chainId: ChainId) {
    const account = await AccountProxy.getById(sub);
    const isMetamask = account.variant === AccountVariant.Metamask;
    return await Wallet.findOne({
        sub,
        chainId,
        address: { $exists: true, $ne: '' },
        ...(isMetamask
            ? { version: { $exists: false }, safeVersion: { $exists: false } }
            : { address: { $exists: true, $ne: '' }, safeVersion: '1.3.0' }),
    });
}

async function findOneByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.findOne(query);
}

async function findByQuery(query: { sub?: string; chainId?: number }) {
    return await Wallet.find(query);
}

async function getOwners(wallet: WalletDocument) {
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });

    return await safeSdk.getOwners();
}

async function createSwapOwnerTransaction(wallet: WalletDocument, oldOwnerAddress: string, newOwnerAddress: string) {
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });

    return await safeSdk.createSwapOwnerTx({ oldOwnerAddress, newOwnerAddress });
}

async function proposeTransaction(wallet: WalletDocument, safeTransactionData: SafeTransactionDataPartial) {
    const { ethAdapter, signer } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });
    const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
    const safeSDK = getSafeSDK(wallet.chainId);

    try {
        await safeSDK.proposeTransaction({
            safeAddress: wallet.address,
            safeTxHash,
            safeTransactionData: safeTransaction.data as any,
            senderAddress: toChecksumAddress(await signer.getAddress()),
            senderSignature: senderSignature.data,
        });

        logger.info(`Safe TX Proposed: ${safeTxHash}`);
    } catch (error) {
        console.log(error);
        logger.info(error);
    }

    return safeTxHash;
}

async function confirmTransaction(wallet: WalletDocument, safeTxHash: string) {
    const { ethAdapter } = getProvider(wallet.chainId);
    const safe = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });
    const signature = await safe.signTransactionHash(safeTxHash);
    return await confirm(wallet, safeTxHash, signature.data);
}

async function confirm(wallet: WalletDocument, safeTxHash: string, signatureData: string) {
    const safeSDK = getSafeSDK(wallet.chainId);
    return await safeSDK.confirmTransaction(safeTxHash, signatureData);
}

async function executeTransaction(wallet: WalletDocument, safeTxHash: string) {
    const { ethAdapter, signer } = getProvider(wallet.chainId);
    const safeService = getSafeSDK(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });
    const safeTransaction = await safeService.getTransaction(safeTxHash);
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction as any, {
        from: await signer.getAddress(),
    });

    return await executeTxResponse.transactionResponse?.wait();
}

async function getLastPendingTransactions(wallet: WalletDocument) {
    const safeService = getSafeSDK(wallet.chainId);
    const { results }: any = await safeService.getPendingTransactions(toChecksumAddress(wallet.address));

    return results as unknown as SafeMultisigTransactionResponse[];
}

async function getTransaction(wallet: WalletDocument, safeTxHash: string): Promise<SafeMultisigTransactionResponse> {
    const safeSDK = getSafeSDK(wallet.chainId);
    return (await safeSDK.getTransaction(safeTxHash)) as unknown as SafeMultisigTransactionResponse;
}

export default {
    getWalletMigration,
    migrate,
    createSwapOwnerTransaction,
    proposeTransaction,
    confirmTransaction,
    confirm,
    getLastPendingTransactions,
    getOwners,
    findPrimary,
    create,
    findOneByAddress,
    findByQuery,
    findOneByQuery,
    getTransaction,
    executeTransaction,
};
