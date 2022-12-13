import { toWei } from 'web3-utils';
import { ChainId, TransactionState, WithdrawalState, WithdrawalType } from '@thxnetwork/api/types/enums';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Withdrawal, WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import type { IAccount } from '@thxnetwork/api/models/Account';
import { assertEvent, parseLogs } from '@thxnetwork/api/util/events';
import TransactionService from './TransactionService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { TWithdrawForCallbackArgs } from '@thxnetwork/api/types/TTransaction';
import { TransactionReceipt } from 'web3-core';
import PoolService from './PoolService';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { Transaction } from '@thxnetwork/api/models/Transaction';

export default class WithdrawalService {
    static getById(id: string) {
        return Withdrawal.findById(id);
    }

    static countScheduled() {
        return Withdrawal.find({
            $or: [{ failReason: { $exists: false } }, { failReason: '' }],
            transactionHash: { $exists: false },
            state: WithdrawalState.Pending,
        });
    }

    static getAllScheduled(poolId: string) {
        return Withdrawal.find({
            $or: [{ failReason: { $exists: false } }, { failReason: '' }],
            transactionHash: { $exists: false },
            state: WithdrawalState.Pending,
            poolId,
        });
    }

    static getByPoolAndRewardID(poolId: string, rewardId: number) {
        return Withdrawal.find({
            poolId,
            rewardId,
        });
    }

    static create(
        assetPool: AssetPoolDocument,
        type: WithdrawalType,
        sub: string,
        amount: number,
        state = WithdrawalState.Pending,
        unlockDate?: Date,
        rewardId?: string,
    ) {
        return Withdrawal.create({
            type,
            sub,
            poolId: String(assetPool._id),
            amount,
            state,
            rewardId,
            unlockDate,
        });
    }

    static async getPendingBalance(account: IAccount, poolId: string) {
        const withdrawals = await Withdrawal.find({
            poolId,
            sub: account.id,
            state: WithdrawalState.Pending,
        });
        return withdrawals.map((item) => item.amount).reduce((prev, curr) => prev + curr, 0);
    }

    static async withdrawFor(
        pool: AssetPoolDocument,
        withdrawal: WithdrawalDocument,
        account: IAccount,
        forceSync = true,
    ) {
        const amountInWei = toWei(String(withdrawal.amount));

        const txId = await TransactionService.sendAsync(
            pool.contract.options.address,
            pool.contract.methods.withdrawFor(account.address, amountInWei),
            pool.chainId,
            forceSync,
            {
                type: 'withdrawForCallback',
                args: { assetPoolId: String(pool._id), withdrawalId: String(withdrawal._id) },
            },
        );

        return Withdrawal.findByIdAndUpdate(withdrawal._id, { transactions: [txId] }, { new: true });
    }

    static async withdrawForCallback(args: TWithdrawForCallbackArgs, receipt: TransactionReceipt) {
        const { assetPoolId, withdrawalId } = args;
        const { contract } = await PoolService.getById(assetPoolId);
        const events = parseLogs(contract.options.jsonInterface, receipt.logs);

        assertEvent('ERC20WithdrawFor', events);

        await Withdrawal.findByIdAndUpdate(withdrawalId, { state: WithdrawalState.Withdrawn });
    }

    static async queryWithdrawTransaction(withdrawal: WithdrawalDocument): Promise<WithdrawalDocument> {
        if (withdrawal.state !== WithdrawalState.Withdrawn && withdrawal.transactions[0]) {
            const tx = await Transaction.findById(withdrawal.transactions[0]);
            const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
            if (txResult === TransactionState.Mined) {
                withdrawal = await this.getById(withdrawal._id);
            }
        }

        return withdrawal;
    }

    static countByPool(assetPool: AssetPoolDocument) {
        return Withdrawal.find({ poolId: String(assetPool._id) }).count();
    }

    static findByQuery(query: { poolId: string; rewardId: string }) {
        return Withdrawal.find(query);
    }

    static async getAll(
        poolId: string,
        page: number,
        limit: number,
        beneficiary?: string,
        rewardId?: string,
        state?: number,
    ) {
        const account = beneficiary ? await AccountProxy.getByAddress(beneficiary) : undefined;
        const query = {
            ...(poolId ? { poolId } : {}),
            ...(account ? { sub: account.id } : {}),
            ...(rewardId ? { rewardId } : {}),
            ...(state === 0 || state === 1 ? { state } : {}),
        };
        return paginatedResults(Withdrawal, page, limit, query);
    }

    static async removeAllForPool(pool: AssetPoolDocument) {
        const withdrawals = await Withdrawal.find({ poolId: String(pool._id) });

        for (const w of withdrawals) {
            await w.remove();
        }
    }

    static async hasClaimedOnce(poolId: string, sub: string, rewardId: string) {
        const withdrawal = await Withdrawal.findOne({
            sub,
            rewardId,
            poolId,
        });

        return !!withdrawal;
    }

    static getByBeneficiary(beneficiary: string) {
        return Withdrawal.find({ beneficiary });
    }

    static countByNetwork(chainId: ChainId) {
        return Withdrawal.countDocuments({ chainId });
    }
}
