import { TAssetPool } from '@thxnetwork/api/types/TAssetPool';
import { Deposit, DepositDocument } from '@thxnetwork/api/models/Deposit';
import { IAccount } from '@thxnetwork/api/models/Account';
import { DepositState } from '@thxnetwork/api/types/enums/DepositState';
import TransactionService from './TransactionService';
import { assertEvent, CustomEventLog } from '@thxnetwork/api/util/events';
import { TransactionDocument } from '@thxnetwork/api/models/Transaction';

async function get(assetPool: TAssetPool, depositId: number): Promise<DepositDocument> {
    const deposit = await Deposit.findOne({ poolAddress: assetPool.address, id: depositId });
    if (!deposit) return null;
    return deposit;
}

async function getAll(assetPool: TAssetPool): Promise<DepositDocument[]> {
    return await Deposit.find({ poolAddress: assetPool.address });
}

async function deposit(assetPool: TAssetPool, account: IAccount, amount: string, item: string) {
    const deposit = await Deposit.create({
        sub: account.id,
        sender: account.address,
        receiver: assetPool.address,
        amount,
        state: DepositState.Pending,
        item,
    });
    const callback = async (tx: TransactionDocument, events?: CustomEventLog[]) => {
        if (events) {
            assertEvent('ERC20DepositFrom', events);
            deposit.state = DepositState.Completed;
        }
        deposit.transactions.push(String(tx._id));
        return await deposit.save();
    };

    return await TransactionService.relay(
        assetPool.contract,
        'depositFrom',
        [account.address, amount],
        assetPool.chainId,
        callback,
    );
}

export default { get, getAll, deposit };
