import { Wallet as WalletModel, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { ChainId } from '@thxnetwork/types/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { contractNetworks, safeVersion } from '@thxnetwork/api/config/contracts';
import { toChecksumAddress } from 'web3-utils';
import { MONGODB_URI } from '@thxnetwork/api/config/secrets';
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
import { agenda, JobType } from '@thxnetwork/api/util/agenda';
import { MongoClient } from 'mongodb';
import { Job } from '@hokify/agenda';
import { AssetPoolDocument } from '../models/AssetPool';
import { Transaction } from '../models/Transaction';
import TransactionService from './TransactionService';
import { convertObjectIdToNumber } from '../util';

export const Wallet = WalletModel;

function getSafeSDK(chainId: ChainId) {
    const { txServiceUrl, ethAdapter } = getProvider(chainId);
    return new SafeApiKit({ txServiceUrl, ethAdapter });
}

function reset(wallet: WalletDocument, userWalletAddress: string) {
    const { defaultAccount } = getProvider(wallet.chainId);
    return deploy(wallet, [toChecksumAddress(defaultAccount), toChecksumAddress(userWalletAddress)]);
}

async function create(
    data: { chainId: ChainId; sub: string; safeVersion?: SafeVersion; address?: string; poolId?: string },
    userWalletAddress?: string,
) {
    const { safeVersion, chainId, sub, address, poolId } = data;
    const { defaultAccount } = getProvider(chainId);
    const wallet = await Wallet.create({ sub, chainId, address, safeVersion, poolId });

    // Concerns a Metamask account so we do not deploy and return early
    if (!safeVersion && address) return wallet;

    // Add relayer address and consider this a campaign safe
    const owners = [toChecksumAddress(defaultAccount)];
    // Add user address as a signer and consider this a participant safe
    if (userWalletAddress) owners.push(toChecksumAddress(userWalletAddress));

    // If campaign safe we provide a nonce based on the timestamp in the MongoID the pool (poolId value)
    const nonce = wallet.poolId && String(convertObjectIdToNumber(wallet.poolId));

    return await deploy(wallet, owners, nonce);
}

async function deploy(wallet: WalletDocument, owners: string[], nonce?: string) {
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeFactory = await SafeFactory.create({
        safeVersion: wallet.safeVersion as SafeVersion,
        ethAdapter,
        contractNetworks,
    });
    const safeAccountConfig: SafeAccountConfig = {
        owners,
        threshold: owners.length,
    };
    const safeAddress = toChecksumAddress(await safeFactory.predictSafeAddress(safeAccountConfig, nonce));

    try {
        await Safe.create({
            ethAdapter,
            safeAddress,
            contractNetworks,
        });
    } catch (error) {
        await agenda.now(JobType.DeploySafe, {
            safeAccountConfig,
            safeVersion: wallet.safeVersion,
            safeAddress,
            safeWalletId: String(wallet._id),
        });
    }

    return await Wallet.findByIdAndUpdate(wallet._id, { address: safeAddress }, { new: true });
}

async function createJob(job: Job) {
    const { safeAccountConfig, safeVersion, safeAddress, safeWalletId } = job.attrs.data as any;
    if (!safeAccountConfig || !safeVersion || !safeAddress || !safeWalletId) return;

    const wallet = await Wallet.findById(safeWalletId);
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeFactory = await SafeFactory.create({
        safeVersion,
        ethAdapter,
        contractNetworks,
    });

    // If campaign safe we provide a nonce based on the timestamp in the MongoID the pool (poolId value)
    const nonce = wallet.poolId && String(convertObjectIdToNumber(wallet.poolId));
    const config = { safeAccountConfig, options: { gasLimit: '3000000' } };
    if (nonce) config['saltNonce'] = nonce;

    await safeFactory.deploySafe(config);
    logger.debug(`[${wallet.sub}] Deployed Safe: ${safeAddress}`);
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

async function migrateJob(job: Job) {
    const { safeWalletId } = job.attrs.data as any;
    if (!safeWalletId) return;

    const safeWallet = await Wallet.findById(safeWalletId);
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();

        const db = client.db();
        const walletsCollection = db.collection('wallets');
        const wallets = await walletsCollection.find({ sub: safeWallet.sub }).toArray();
        const walletIds = wallets.map((wallet) => String(wallet._id));

        // No virtual wallet or old wallet exists so migration not required
        if (walletIds.length < 2) return;

        const models = [
            'dailyrewardclaims',
            'erc20perkpayments',
            'erc20token',
            'erc20transfers',
            'erc721perkpayments',
            'erc721token',
            'erc721transfers',
            'erc1155token',
            'milestonerewardclaims',
            'pointbalances',
            'pointrewardclaims',
            'poolsubscriptions',
            'referralrewardclaims',
            'withdrawals',
        ];

        for (const modelName of models) {
            const modelCollection = db.collection(modelName);
            await modelCollection.updateMany(
                { walletId: { $in: walletIds } },
                { $set: { walletId: String(safeWallet._id) } },
            );
        }

        logger.debug('Migration completed.');
    } catch (error) {
        logger.error(`Error: ${String(error)}`);
    } finally {
        await client.close();
    }
}
async function migrate(safeWallet: WalletDocument) {
    if (!safeWallet) return;
    await agenda.now(JobType.MigrateWallets, { safeWalletId: String(safeWallet._id) });
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
        poolId: { $exists: false },
        address: { $exists: true, $ne: '' },
        ...(isMetamask
            ? { version: { $exists: false }, safeVersion: { $exists: false } }
            : { address: { $exists: true, $ne: '' }, safeVersion: '1.3.0' }),
    });
}

async function findOneByPool(pool: AssetPoolDocument, chainId: ChainId) {
    return await Wallet.findOne({
        chainId,
        sub: pool.sub,
        poolId: String(pool._id),
        safeVersion,
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
        return safeTxHash;
    } catch (error) {
        logger.error(error);
    }
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
    const { ethAdapter } = getProvider(wallet.chainId);
    const safeService = getSafeSDK(wallet.chainId);
    const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress: wallet.address,
        contractNetworks,
    });
    const safeTransaction = await safeService.getTransaction(safeTxHash);
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction as any);
    const receipt = await executeTxResponse.transactionResponse?.wait();
    const tx = await Transaction.findOne({ safeTxHash });

    await TransactionService.executeCallback(tx, receipt as any);

    return receipt;
}

async function getLastPendingTransactions(wallet: WalletDocument) {
    const safeService = getSafeSDK(wallet.chainId);
    const { results }: any = await safeService.getPendingTransactions(wallet.address);

    return results as unknown as SafeMultisigTransactionResponse[];
}

async function getTransaction(wallet: WalletDocument, safeTxHash: string): Promise<SafeMultisigTransactionResponse> {
    const safeSDK = getSafeSDK(wallet.chainId);
    return (await safeSDK.getTransaction(safeTxHash)) as unknown as SafeMultisigTransactionResponse;
}

export default {
    getWalletMigration,
    reset,
    migrate,
    migrateJob,
    createSwapOwnerTransaction,
    proposeTransaction,
    confirmTransaction,
    confirm,
    getLastPendingTransactions,
    getOwners,
    findPrimary,
    create,
    createJob,
    findOneByAddress,
    findByQuery,
    findOneByQuery,
    getTransaction,
    executeTransaction,
    findOneByPool,
};
