import { contractNetworks } from '@thxnetwork/api/config/contracts';
import { Wallet as WalletModel, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ChainId } from '@thxnetwork/types/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { toChecksumAddress } from 'web3-utils';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';
import {
    SafeMultisigTransactionResponse,
    SafeTransactionDataPartial,
    SafeVersion,
} from '@safe-global/safe-core-sdk-types';
import { logger } from '@thxnetwork/api/util/logger';
import ERC20Service from './ERC20Service';
import ERC721Service from './ERC721Service';
import AccountProxy from '../proxies/AccountProxy';
import { AccountVariant } from '@thxnetwork/types/interfaces';

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
        contractNetworks: wallet.chainId === ChainId.Hardhat ? contractNetworks : undefined,
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
            contractNetworks: wallet.chainId === ChainId.Hardhat ? contractNetworks : undefined,
        });
    } catch (error) {
        safeFactory
            .deploySafe({ safeAccountConfig, options: { gasLimit: '3000000' } })
            .then(() => logger.debug(`[${sub}] Deployed Safe:`, safeAddress))
            .catch(console.error);
    }

    return await Wallet.findByIdAndUpdate(wallet._id, { address: safeAddress }, { new: true });
}

function transferAll(fromWallet: WalletDocument, toWallet: WalletDocument) {
    ERC20Service.migrateAll(fromWallet, toWallet);
    ERC721Service.migrateAll(fromWallet, toWallet);
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
        contractNetworks: wallet.chainId === ChainId.Hardhat ? contractNetworks : undefined,
    });

    return await safeSdk.getOwners();
}

async function createSwapOwnerTransaction(wallet: WalletDocument, oldOwnerAddress: string, newOwnerAddress: string) {
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks: wallet.chainId === ChainId.Hardhat ? contractNetworks : undefined,
    });

    return await safeSdk.createSwapOwnerTx({ oldOwnerAddress, newOwnerAddress });
}

async function proposeTransaction(wallet: WalletDocument, safeTransactionData: SafeTransactionDataPartial) {
    const { ethAdapter, signer } = getProvider(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks: wallet.chainId === ChainId.Hardhat ? contractNetworks : undefined,
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
        contractNetworks: wallet.chainId === ChainId.Hardhat ? contractNetworks : undefined,
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
        contractNetworks: wallet.chainId === ChainId.Hardhat ? contractNetworks : undefined,
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
    transferAll,
};
