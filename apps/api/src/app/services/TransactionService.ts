import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId, TransactionState, TransactionType } from '@thxnetwork/common/enums';
import { MINIMUM_GAS_LIMIT, RELAYER_SPEED } from '@thxnetwork/api/config/secrets';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { TransactionReceipt } from 'web3-eth-accounts/node_modules/web3-core';
import { toChecksumAddress } from 'web3-utils';
import { poll } from '@thxnetwork/api/util/polling';
import { deployCallback as erc20DeployCallback } from './ERC20Service';
import { RelayerTransactionPayload } from '@openzeppelin/defender-relay-client';
import { Contract } from 'web3-eth-contract';
import { Transaction, TransactionDocument, WalletDocument } from '@thxnetwork/api/models';
import ERC721Service from './ERC721Service';
import ERC1155Service from './ERC1155Service';
import SafeService from './SafeService';

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
            gas: gas + 100000,
        });

        await transactionMined(tx, receipt);
    }

    // We return the id because the transaction might be out of date and the transaction is not used by callers anyway.
    return String(tx._id);
}

async function execSafeAsync(wallet: WalletDocument, tx: TransactionDocument) {
    const { relayer } = getProvider(wallet.chainId);
    const safeTransaction = await SafeService.getTransaction(wallet, tx.safeTxHash);

    // If there is no relayer for the network the safe executes immediately
    if (!relayer) {
        const receipt = await SafeService.executeTransaction(wallet, tx.safeTxHash);
        await transactionMined(tx, receipt as any);
        return;
    }

    // If there is a relayer the transaction is sent to Defender and the job
    // processor polls for the receipt and invokes callback
    const defenderTx = await relayer.sendTransaction({
        to: safeTransaction.to,
        data: safeTransaction.data,
        gasLimit: safeTransaction.safeTxGas || '196000',
        speed: RELAYER_SPEED,
    });

    await tx.updateOne({
        transactionId: defenderTx.transactionId,
        transactionHash: defenderTx.hash,
        state: TransactionState.Sent,
    });
}

async function proposeSafeAsync(
    wallet: WalletDocument,
    to: string | null,
    data: string,
    callback?: TTransactionCallback,
) {
    const { relayer, defaultAccount } = getProvider(wallet.chainId);
    const safeTxHash = await SafeService.proposeTransaction(wallet, {
        to,
        data,
        value: '0',
    });

    await SafeService.confirmTransaction(wallet, safeTxHash);

    return await Transaction.create({
        type: relayer ? TransactionType.Relayed : TransactionType.Default,
        state: TransactionState.Confirmed,
        safeTxHash,
        chainId: wallet.chainId,
        walletId: String(wallet._id),
        from: defaultAccount,
        to,
        callback,
    });
}

async function sendSafeAsync(wallet: WalletDocument, to: string | null, fn: any, callback?: TTransactionCallback) {
    const data = fn.encodeABI();
    return proposeSafeAsync(wallet, to, data, callback);
}

async function deploy(abi: any, bytecode: any, arg: any[], chainId: ChainId) {
    const { web3, defaultAccount } = getProvider(chainId);
    const contract = new web3.eth.Contract(abi) as unknown as Contract;
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
    if (!tx || !tx.callback) return;
    switch (tx.callback.type) {
        case 'Erc20DeployCallback':
            await erc20DeployCallback(tx.callback.args, receipt);
            break;
        case 'Erc721DeployCallback':
            await ERC721Service.deployCallback(tx.callback.args, receipt);
            break;
        case 'ERC1155DeployCallback':
            await ERC1155Service.deployCallback(tx.callback.args, receipt);
            break;
        case 'erc721TokenMintCallback':
            await ERC721Service.mintCallback(tx.callback.args, receipt);
            break;
        case 'erc1155TokenMintCallback':
            await ERC1155Service.mintCallback(tx.callback.args, receipt);
            break;
        case 'erc721nTransferFromCallback':
            await ERC721Service.transferFromCallback(tx.callback.args, receipt);
            break;
        case 'erc1155TransferFromCallback':
            await ERC1155Service.transferFromCallback(tx.callback.args, receipt);
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
    sendSafeAsync,
    execSafeAsync,
    queryTransactionStatusDefender,
    queryTransactionStatusReceipt,
    executeCallback,
    proposeSafeAsync,
};
