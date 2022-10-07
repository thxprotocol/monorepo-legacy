import { TAssetPool } from '@thxnetwork/api/types/TAssetPool';
import { Deposit, DepositDocument } from '@thxnetwork/api/models/Deposit';
import { IAccount } from '@thxnetwork/api/models/Account';
import { DepositState } from '@thxnetwork/api/types/enums/DepositState';
import TransactionService from './TransactionService';
import { assertEvent, parseLogs } from '@thxnetwork/api/util/events';
import { TDepositCallbackArgs } from '@thxnetwork/api/types/TTransaction';
import AssetPoolService from './AssetPoolService';
import { TransactionReceipt } from 'web3-core';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';

async function get(assetPool: TAssetPool, depositId: number): Promise<DepositDocument> {
    const deposit = await Deposit.findOne({ poolAddress: assetPool.address, id: depositId });
    if (!deposit) return null;
    return deposit;
}

async function getAll(assetPool: TAssetPool): Promise<DepositDocument[]> {
    return Deposit.find({ poolAddress: assetPool.address });
}

async function deposit(assetPool: AssetPoolDocument, account: IAccount, amount: string, item: string) {
    const deposit = await Deposit.create({
        sub: account.id,
        sender: account.address,
        receiver: assetPool.address,
        amount,
        state: DepositState.Pending,
        item,
    });

    const txId = await TransactionService.sendAsync(
        assetPool.contract.options.address,
        assetPool.contract.methods.depositFrom(account.address, amount),
        assetPool.chainId,
        true,
        { type: 'depositCallback', args: { depositId: String(deposit._id), assetPoolId: String(assetPool._id) } },
    );

    return Deposit.findByIdAndUpdate(deposit._id, { transactions: [txId] }, { new: true });
}

async function depositCallback({ depositId, assetPoolId }: TDepositCallbackArgs, receipt: TransactionReceipt) {
    const { contract } = await AssetPoolService.getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);

    assertEvent('ERC20DepositFrom', events);

    await Deposit.findByIdAndUpdate(depositId, { state: DepositState.Completed });
}

export default { get, getAll, deposit, depositCallback };
