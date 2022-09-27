import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';
import { Payment, PaymentDocument } from '@thxnetwork/api/models/Payment';
import { WALLET_URL } from '@thxnetwork/api/config/secrets';
import { assertEvent, CustomEventLog } from '@thxnetwork/api/util/events';
import { TransactionDocument } from '@thxnetwork/api/models/Transaction';
import TransactionService from './TransactionService';
import { createRandomToken } from '@thxnetwork/api/util/token';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Contract } from 'web3-eth-contract';
import ERC721Service from './ERC721Service';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { logger } from '@thxnetwork/api/util/logger';
import AssetPoolService from './AssetPoolService';

async function create(
    pool: AssetPoolDocument,
    chainId: string,
    {
        amount,
        successUrl,
        failUrl,
        cancelUrl,
        metadataId,
    }: { amount: string; successUrl: string; failUrl: string; cancelUrl: string; metadataId?: string },
) {
    const token = createRandomToken();
    const address = await pool.contract.methods.getERC20().call();
    const erc20 = await ERC20Service.findOrImport(pool, address);

    return await Payment.create({
        poolId: pool._id,
        chainId,
        state: PaymentState.Requested,
        token,
        amount,
        receiver: pool.address,
        tokenAddress: erc20.address,
        successUrl,
        failUrl,
        cancelUrl,
        metadataId,
    });
}

async function get(id: string) {
    return Payment.findById(id);
}

async function findByPool(pool: AssetPoolDocument) {
    return Payment.find({
        poolId: String(pool._id),
    });
}

async function pay(contract: Contract, payment: PaymentDocument) {
    payment.state = PaymentState.Pending;
    await payment.save();

    return await TransactionService.relay(
        contract,
        'transferFrom',
        [payment.sender, payment.receiver, payment.amount],
        payment.chainId,
        async (tx: TransactionDocument, events?: CustomEventLog[]): Promise<PaymentDocument> => {
            if (events) {
                assertEvent('Transfer', events);
                payment.state = PaymentState.Completed;
            }
            payment.transactions.push(String(tx._id));

            if (payment.metadataId) {
                // PERFORM THE MINT OF THE NFT
                try {
                    const metadata = await ERC721Service.findMetadataById(payment.metadataId);
                    const erc721 = await ERC721Service.findById(metadata.erc721);
                    const assetPool = await AssetPoolService.getById(payment.poolId);
                    const account = await AccountProxy.getByAddress(payment.sender);
                    await ERC721Service.mint(assetPool, erc721, metadata, account);
                } catch (err) {
                    logger.error(err);
                    throw new Error('ERROR ON MINT AFTER PAYMENT');
                }
            }
            return await payment.save();
        },
    );
}

function getPaymentUrl(id: string, token: string) {
    return `${WALLET_URL}/payment/${String(id)}?accessToken=${token}`;
}

export default { create, pay, get, getPaymentUrl, findByPool };
