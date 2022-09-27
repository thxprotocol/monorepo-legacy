import { TAssetPool } from '@thxnetwork/api/types/TAssetPool';
import { ERC20Swap, ERC20SwapDocument } from '@thxnetwork/api/models/ERC20Swap';
import TransactionService from './TransactionService';
import { assertEvent, CustomEventLog, findEvent, hex2a } from '@thxnetwork/api/util/events';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { SwapState } from '@thxnetwork/api/types/enums/SwapState';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { ERC20SwapRuleDocument } from '@thxnetwork/api/models/ERC20SwapRule';
import { IAccount } from '@thxnetwork/api/models/Account';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';

async function get(id: string): Promise<ERC20SwapDocument> {
    const erc20Swap = await ERC20Swap.findById(id);
    if (!erc20Swap) throw new NotFoundError('Could not find this Swap');
    return erc20Swap;
}

async function getAll(assetPool: TAssetPool): Promise<ERC20SwapDocument[]> {
    return await ERC20Swap.find({ poolAddress: assetPool.address });
}

async function create(
    assetPool: AssetPoolDocument,
    account: IAccount,
    swapRule: ERC20SwapRuleDocument,
    erc20TokenIn: ERC20Document,
    amountInInWei: string,
) {
    const swap = await ERC20Swap.create({
        swapRuleId: swapRule._id,
        amountIn: amountInInWei,
    });

    const callback = async (tx: TransactionDocument, events?: CustomEventLog[]): Promise<ERC20SwapDocument> => {
        if (events) {
            assertEvent('ERC20SwapFor', events);
            const swapEvent = findEvent('ERC20SwapFor', events);

            swap.transactions.push(String(tx._id));
            swap.state = SwapState.Completed;
            swap.amountOut = swapEvent.args.amountOut;
        }
        swap.transactions.push(String(tx._id));

        return await swap.save();
    };

    return await TransactionService.relay(
        assetPool.contract,
        'swapFor',
        [account.address, amountInInWei, erc20TokenIn.address],
        assetPool.chainId,
        callback,
    );
}

export default { get, getAll, create };
