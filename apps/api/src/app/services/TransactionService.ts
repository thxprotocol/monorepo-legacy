import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId, TransactionState, TransactionType } from '@thxnetwork/api/types/enums';
import { MINIMUM_GAS_LIMIT, RELAYER_SPEED } from '@thxnetwork/api/config/secrets';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import type { TTransaction, TTransactionCallback } from '@thxnetwork/api/types/TTransaction';
import { TransactionReceipt } from 'web3-core';
import { toChecksumAddress } from 'web3-utils';
import { poll } from '@thxnetwork/api/util/polling';
import { deployCallback as erc20DeployCallback } from './ERC20Service';
import AssetPoolService from './AssetPoolService';
import DepositService from './DepositService';
import ERC20SwapService from './ERC20SwapService';
import ERC721Service from './ERC721Service';
import PaymentService from './PaymentService';
import WithdrawalService from './WithdrawalService';
import { RelayerTransactionPayload } from 'defender-relay-client';
import WalletService from './WalletService';
import WalletManagerService from './WalletManagerService';

function getById(id: string) {
    return Transaction.findById(id);
}

async function sendValue(to: string, value: string, chainId: ChainId) {
    const { web3, defaultAccount } = getProvider(chainId);
    const from = defaultAccount;
    const gas = '21000';

    let tx = await Transaction.create({
        state: TransactionState.Queued,
        chainId,
        from,
        to,
        gas,
    });

    const receipt = await web3.eth.sendTransaction({
        from,
        to,
        value,
        gas,
    });

    if (receipt.transactionHash) {
        tx.transactionHash = receipt.transactionHash;
        tx.state = TransactionState.Mined;
        tx = await tx.save();
    }

    return { tx, receipt };
}

async function send(to: string, fn: any, chainId: ChainId) {
    const { web3, defaultAccount } = getProvider(chainId);
    const from = defaultAccount;
    const data = fn.encodeABI();
    const estimate = await fn.estimateGas({ from });
    const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;

    return web3.eth.sendTransaction({
        from,
        to,
        data,
        gas,
    });
}

/**
 * Creates a transaction in the db and either executes or schedules a web3 transaction.
 *
 * When the chain has a relayer configured the transaction is scheduled through it instead of directly executed.
 *
 * By setting the forceSync bool to true you can force the call to behave synchronously. It will poll for the transaction to be executed and only return after the transaction and its callback are executed.
 *
 * @param to Recipient
 * @param fn Web3 contract method
 * @param chainId Chainid to execute on
 * @param forceSync Boolean to force synchronous execution, this waits for the transaction to be processed before returning.
 * @param callback Callback configuration.
 * @returns The transaction ID. This can be stored so the status of the transaction can be queried.
 */
async function sendAsync(
    to: string | null,
    fn: any,
    chainId: ChainId,
    forceSync = true,
    callback?: TTransactionCallback,
) {
    const { web3, relayer, defaultAccount } = getProvider(chainId);
    const data = fn.encodeABI();

    const estimate = await fn.estimateGas({ from: defaultAccount });
    const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;

    const tx = await Transaction.create({
        type: relayer && !forceSync ? TransactionType.Relayed : TransactionType.Default,
        state: TransactionState.Queued,
        from: defaultAccount,
        to,
        chainId,
        callback,
    });
    if (relayer) {
        const args: RelayerTransactionPayload = {
            data,
            speed: RELAYER_SPEED,
            gasLimit: gas,
        };
        if (to) args.to = to;

        const defenderTx = await relayer.sendTransaction(args);

        Object.assign(tx, {
            transactionId: defenderTx.transactionId,
            transactionHash: defenderTx.hash,
            state: TransactionState.Sent,
        });

        await tx.save();

        if (forceSync) {
            await poll(
                async () => {
                    const transaction = await getById(tx._id);
                    return queryTransactionStatusReceipt(transaction);
                },
                (state: TransactionState) => state === TransactionState.Sent,
                500,
            );
        }
    } else {
        const receipt = await web3.eth.sendTransaction({
            from: defaultAccount,
            to,
            data,
            gas,
        });

        await transactionMined(tx, receipt);
    }

    // We return the id because the transaction might be out of date and the transaction is not used by callers anyway.
    return String(tx._id);
}

async function deploy(abi: any, bytecode: any, arg: any[], chainId: ChainId) {
    const { web3, defaultAccount } = getProvider(chainId);
    const contract = new web3.eth.Contract(abi);
    const gas = await contract
        .deploy({
            data: bytecode,
            arguments: arg,
        })
        .estimateGas();
    const data = contract
        .deploy({
            data: bytecode,
            arguments: arg,
        })
        .encodeABI();

    const tx = await Transaction.create({
        type: TransactionType.Default,
        state: TransactionState.Queued,
        from: defaultAccount,
        chainId,
        gas,
    });

    const receipt = await web3.eth.sendTransaction({
        from: defaultAccount,
        data,
        gas,
    });

    if (receipt.transactionHash) {
        await tx.updateOne({
            to: receipt.to,
            transactionHash: receipt.transactionHash,
            state: TransactionState.Mined,
        });
    }

    contract.options.address = receipt.contractAddress;

    return contract;
}

async function transactionMined(tx: TransactionDocument, receipt: TransactionReceipt) {
    Object.assign(tx, {
        transactionHash: receipt.transactionHash,
        state: TransactionState.Failed,
    });

    if (receipt.to) {
        Object.assign(tx, { to: toChecksumAddress(receipt.to) });
    }

    if (tx.callback) {
        try {
            await executeCallback(tx, receipt);
            tx.state = TransactionState.Mined;
        } catch (e) {
            tx.failReason = e.message;
        }
    }

    await tx.save();
}

async function executeCallback(tx: TransactionDocument, receipt: TransactionReceipt) {
    switch (tx.callback.type) {
        case 'Erc20DeployCallback':
            await erc20DeployCallback(tx.callback.args, receipt);
            break;
        case 'Erc721DeployCallback':
            await ERC721Service.deployCallback(tx.callback.args, receipt);
            break;
        case 'assetPoolDeployCallback':
            await AssetPoolService.deployCallback(tx.callback.args, receipt);
            break;
        case 'topupCallback':
            await AssetPoolService.topupCallback(tx.callback.args, receipt);
            break;
        case 'depositCallback':
            await DepositService.depositCallback(tx.callback.args, receipt);
            break;
        case 'swapCreateCallback':
            await ERC20SwapService.createCallback(tx.callback.args, receipt);
            break;
        case 'erc721TokenMintCallback':
            await ERC721Service.mintCallback(tx.callback.args, receipt);
            break;
        case 'paymentCallback':
            await PaymentService.payCallback(tx.callback.args, receipt);
            break;
        case 'withdrawForCallback':
            await WithdrawalService.withdrawForCallback(tx.callback.args, receipt);
            break;
        case 'walletDeployCallback':
            await WalletService.deployCallback(tx.callback.args, receipt);
            break;
        case 'grantRoleCallBack':
            await WalletManagerService.grantRoleCallBack(tx.callback.args, receipt);
            break;
        case 'revokeRoleCallBack':
            await WalletManagerService.revokeRoleCallBack(tx.callback.args, receipt);
            break;
    }
}

async function queryTransactionStatusDefender(tx: TransactionDocument) {
    if ([TransactionState.Mined, TransactionState.Failed].includes(tx.state)) {
        return tx;
    }
    const { web3, relayer } = getProvider(tx.chainId);

    const defenderTx = await relayer.query(tx.transactionId);

    // Hash has been updated
    if (tx.transactionHash != defenderTx.hash) {
        tx.transactionHash = defenderTx.hash;
        await tx.save();
    }

    if (['mined', 'confirmed'].includes(defenderTx.status)) {
        const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
        await transactionMined(tx, receipt);
    } else if (defenderTx.status === 'failed') {
        tx.state = TransactionState.Failed;
        await tx.save();
    }

    return tx.state;
}

async function queryTransactionStatusReceipt(tx: TransactionDocument) {
    if ([TransactionState.Mined, TransactionState.Failed].includes(tx.state)) {
        return tx;
    }
    const { web3 } = getProvider(tx.chainId);

    const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);

    if (receipt) {
        // Wait 500 ms for transactions to be propagated to all nodes.
        // Since we use multiple RPCs it happens we already have the receipt but the other RPC
        // doesn't have the block available yet.
        await new Promise((done) => setTimeout(done, 500));

        await transactionMined(tx, receipt);
    }

    return tx.state;
}

async function findFailReason(transactions: string[]): Promise<string | undefined> {
    const list = await Promise.all(transactions.map((id: string) => getById(id)));
    const tx = list.filter((tx: TTransaction) => tx.state === TransactionState.Failed);
    if (!tx.length) return;

    return tx[0].failReason;
}

async function findByQuery(poolAddress: string, page = 1, limit = 10, startDate?: Date, endDate?: Date) {
    const query: Record<string, any> = { to: poolAddress };

    if (startDate || endDate) query.createdAt = {};
    if (startDate) {
        query.createdAt['$gte'] = startDate;
    }
    if (endDate) {
        query.createdAt['$lt'] = endDate;
    }

    return paginatedResults(Transaction, page, limit, query);
}

export default {
    getById,
    send,
    sendAsync,
    deploy,
    sendValue,
    findByQuery,
    findFailReason,
    queryTransactionStatusDefender,
    queryTransactionStatusReceipt,
};
