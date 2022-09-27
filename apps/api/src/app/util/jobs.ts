import { Deposit } from '@thxnetwork/api/models/Deposit';
import { TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { Withdrawal } from '@thxnetwork/api/models/Withdrawal';
import MemberService from '@thxnetwork/api/services/MemberService';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { DepositState, WithdrawalState } from '@thxnetwork/api/types/enums';
import { ERC721TokenState } from '@thxnetwork/api/types/TERC721';
import { CustomEventLog, findEvent } from './events';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { logger } from './logger';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { Payment } from '@thxnetwork/api/models/Payment';
import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';
import ERC20 from '@thxnetwork/api/models/ERC20';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';

type CustomEventHandler = (event?: CustomEventLog) => Promise<void>;

async function handleEvents(tx: TransactionDocument, events: CustomEventLog[]) {
    const eventHandlers: { [eventName: string]: CustomEventHandler } = {
        Deposited: async function () {
            await Deposit.updateOne({ transactions: String(tx._id) }, { state: DepositState.Completed });
            await Payment.updateOne({ transactions: String(tx._id) }, { state: PaymentState.Completed });
        },
        Topup: async function () {
            await Deposit.updateOne({ transactions: String(tx._id) }, { state: DepositState.Completed });
            await Payment.updateOne({ transactions: String(tx._id) }, { state: PaymentState.Completed });
        },
        TokenDeployed: async function (event?: CustomEventLog) {
            await ERC20.updateOne({ transactions: String(tx._id) }, { address: event.args.token });
            await ERC721.updateOne({ transactions: String(tx._id) }, { address: event.args.token });
        },
        PoolDeployed: async function (event?: CustomEventLog) {
            const pool = await AssetPool.findOne({ transactions: String(tx._id) });
            pool.address = event.args.pool;
            await pool.save();

            if (pool.erc20Id) {
                await ERC20Service.initialize(pool, event.args.token);
            }
            if (pool.erc721Id) {
                await ERC721Service.initialize(pool, event.args.token);
            }
        },
        ERC721Minted: async function (event?: CustomEventLog) {
            await ERC721Token.updateOne(
                { transactions: String(tx._id) },
                {
                    state: ERC721TokenState.Minted,
                    tokenId: Number(event.args.tokenId),
                    recipient: event.args.recipient,
                    failReason: '',
                },
            );
        },
        WithdrawPollCreated: async function (event?: CustomEventLog) {
            await Withdrawal.updateOne(
                { transactions: String(tx._id) },
                {
                    withdrawalId: Number(event.args.id),
                    poolAddress: tx.to,
                    failReason: '',
                },
            );
        },
        Withdrawn: async function () {
            await Withdrawal.updateOne(
                { transactions: String(tx._id) },
                { state: WithdrawalState.Withdrawn, failReason: '' },
            );
        },
    };

    for (const eventName in eventHandlers) {
        const event = findEvent(eventName, events);

        if (event) {
            await eventHandlers[eventName](event);
        }
    }
}

async function handleError(tx: TransactionDocument, failReason: string) {
    logger.error(failReason);

    await tx.updateOne({ failReason });

    // TODO Remove these and read from tx in controller
    await Withdrawal.updateOne({ transactions: String(tx._id) }, { failReason });
    await Deposit.updateOne({ transactions: String(tx._id) }, { failReason });
    await ERC721Token.updateOne({ transactions: String(tx._id) }, { failReason });
}

export { handleEvents, handleError };
