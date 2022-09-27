import { Document } from 'mongoose';
import { Contract } from 'web3-eth-contract';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId, TransactionState, TransactionType } from '@thxnetwork/api/types/enums';
import { MINIMUM_GAS_LIMIT } from '@thxnetwork/api/config/secrets';
import { CustomEventLog, parseLogs } from '@thxnetwork/api/util/events';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { TTransaction } from '@thxnetwork/api/types/TTransaction';
import { TransactionReceipt } from 'web3-core';
import { reject, resolve } from 'bluebird';

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

async function getReceipt(
    chainId: ChainId,
    tx: TransactionReceipt,
    confirmations: number,
): Promise<TransactionReceipt> {
    const { web3 } = getProvider(chainId);
    return new Promise((resolve, reject) => {
        let counter = 0;
        const interval = setInterval(async function () {
            const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
            if (receipt) {
                clearInterval(interval);
                resolve(receipt);
            }
            if (counter === confirmations) reject();
            counter++;
        }, 500);
    });
}

async function relay(
    contract: Contract,
    fn: string,
    args: any[],
    chainId: ChainId,
    callback: (tx: TransactionDocument, events?: CustomEventLog[]) => Promise<Document>,
): Promise<any> {
    const tx = await queue(contract.options.address, fn, args, chainId);
    const receipt = await send(contract.options.address, contract.methods[fn](...args), chainId);
    const minedReceipt = await getReceipt(chainId, receipt, 3);
    const events = parseLogs(contract.options.jsonInterface, minedReceipt.logs);

    await tx.updateOne({
        state: TransactionState.Mined,
        gas: receipt.gasUsed,
    });

    return await callback(tx, events);
}

async function send(to: string, fn: any, chainId: ChainId, gasLimit?: number) {
    const { web3, defaultAccount } = getProvider(chainId);
    const from = defaultAccount;
    const data = fn.encodeABI();
    const estimate = await fn.estimateGas({ from });
    const gas = gasLimit ? gasLimit : estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;

    return await web3.eth.sendTransaction({
        from,
        to,
        data,
        gas,
    });
}

async function queue(to: string, method: string, params: string[], chainId: ChainId) {
    const { web3, defaultAccount } = getProvider(chainId);
    const nonce = await web3.eth.getTransactionCount(defaultAccount, 'pending');

    return await Transaction.create({
        state: TransactionState.Queued,
        from: defaultAccount,
        call: { fn: method, args: JSON.stringify(params) },
        chainId,
        to,
        nonce,
    });
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

async function findFailReason(transactions: string[]): Promise<string | undefined> {
    const list = await Promise.all(transactions.map((id: string) => getById(id)));
    const tx = list.filter((tx: TTransaction) => tx.state === TransactionState.Failed);
    if (!tx.length) return;

    return tx[0].failReason;
}

async function findByQuery(poolAddress: string, page = 1, limit = 10, startDate?: Date, endDate?: Date) {
    let query;
    if (startDate && !endDate) {
        query = { to: poolAddress, createdAt: { $gte: startDate } };
    } else if (startDate && endDate) {
        query = { to: poolAddress, createdAt: { $gte: startDate, $lt: endDate } };
    } else if (!startDate && endDate) {
        query = { to: poolAddress, createdAt: { $lt: endDate } };
    } else {
        query = { to: poolAddress };
    }
    const result = await paginatedResults(Transaction, page, limit, query);
    return result;
}

export default { relay, queue, getById, send, deploy, sendValue, findByQuery, findFailReason };
