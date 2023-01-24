import { TAssetPool } from '@thxnetwork/api/types/TAssetPool';
import { ERC20Swap, ERC20SwapDocument } from '@thxnetwork/api/models/ERC20Swap';
import TransactionService from './TransactionService';
import { assertEvent, parseLogs } from '@thxnetwork/api/util/events';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { SwapState } from '@thxnetwork/api/types/enums/SwapState';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ERC20SwapRuleDocument } from '@thxnetwork/api/models/ERC20SwapRule';
import type { IAccount } from '@thxnetwork/api/models/Account';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';
import { TSwapCreateCallbackArgs } from '@thxnetwork/api/types/TTransaction';
import { TransactionReceipt } from 'web3-core';
import PoolService from './PoolService';

async function get(id: string): Promise<ERC20SwapDocument> {
    const erc20Swap = await ERC20Swap.findById(id);
    if (!erc20Swap) throw new NotFoundError('Could not find this Swap');
    return erc20Swap;
}

async function getAll(assetPool: TAssetPool): Promise<ERC20SwapDocument[]> {
    return ERC20Swap.find({ poolAddress: assetPool.address });
}

async function create(
    pool: AssetPoolDocument,
    account: IAccount,
    swapRule: ERC20SwapRuleDocument,
    erc20TokenIn: ERC20Document,
    erc20TokenOut: ERC20Document,
    amountInInWei: string,
) {
    const swap = await ERC20Swap.create({
        swapRuleId: swapRule._id,
        amountIn: amountInInWei,
    });
    const address = await account.getAddress(pool.chainId);
    const txId = await TransactionService.sendAsync(
        pool.contract.options.address,
        pool.contract.methods.swapFor(address, amountInInWei, erc20TokenIn.address, erc20TokenOut.address),
        pool.chainId,
        true,
        { type: 'swapCreateCallback', args: { assetPoolId: String(pool._id), swapId: String(swap._id) } },
    );

    return ERC20Swap.findByIdAndUpdate(swap._id, { transactions: [txId] }, { new: true });
}

async function createCallback({ swapId, assetPoolId }: TSwapCreateCallbackArgs, receipt: TransactionReceipt) {
    const { contract } = await PoolService.getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);

    const swapEvent = assertEvent('ERC20SwapFor', events);

    await ERC20Swap.findByIdAndUpdate(swapId, { state: SwapState.Completed, amountOut: swapEvent.args.amountOut });
}

export default { get, getAll, create, createCallback };
