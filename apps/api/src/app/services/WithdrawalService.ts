import { toWei } from 'web3-utils';
import { ChainId } from '@thxnetwork/api/types/enums';
import { WithdrawalState, WithdrawalType } from '@thxnetwork/api/types/enums';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Withdrawal, WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import { IAccount } from '@thxnetwork/api/models/Account';
import { assertEvent, CustomEventLog } from '@thxnetwork/api/util/events';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { TransactionDocument } from '@thxnetwork/api/models/Transaction';
import TransactionService from './TransactionService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

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

    static schedule(
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

    static async withdrawFor(pool: AssetPoolDocument, withdrawal: WithdrawalDocument, account: IAccount) {
        const amountInWei = toWei(String(withdrawal.amount));
        const callback = async (tx: TransactionDocument, events?: CustomEventLog[]) => {
            if (events) {
                assertEvent('ERC20WithdrawFor', events);
                withdrawal.state = WithdrawalState.Withdrawn;
            }
            withdrawal.transactions.push(String(tx._id));
            return await withdrawal.save();
        };
        return await TransactionService.relay(
            pool.contract,
            'withdrawFor',
            [account.address, amountInWei],
            pool.chainId,
            callback,
        );
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
        return await paginatedResults(Withdrawal, page, limit, query);
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
