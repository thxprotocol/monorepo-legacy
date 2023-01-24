import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';
import { Payment, PaymentDocument } from '@thxnetwork/api/models/Payment';
import { WALLET_URL } from '@thxnetwork/api/config/secrets';
import { assertEvent, parseLogs } from '@thxnetwork/api/util/events';
import TransactionService from './TransactionService';
import { createRandomToken } from '@thxnetwork/api/util/token';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Contract } from 'web3-eth-contract';
import ERC721Service from './ERC721Service';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { logger } from '@thxnetwork/api/util/logger';
import PoolService from './PoolService';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { TransactionReceipt } from 'web3-core';
import { TPayCallbackArgs } from '@thxnetwork/api/types/TTransaction';
import { TokenContractName } from '@thxnetwork/contracts/exports';
import db from '@thxnetwork/api/util/database';

async function create(
    pool: AssetPoolDocument,
    chainId: string,
    {
        amount,
        successUrl,
        failUrl,
        cancelUrl,
        metadataId,
        promotionId,
    }: {
        amount: string;
        successUrl: string;
        failUrl: string;
        cancelUrl: string;
        metadataId?: string;
        promotionId?: string;
    },
) {
    const token = createRandomToken();
    const erc20 = await ERC20Service.findByPool(pool);

    return Payment.create({
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
        promotionId,
        id: db.createUUID(),
    });
}

async function get(id: string) {
    return Payment.findOne({ id });
}

async function findByPool(pool: AssetPoolDocument) {
    return Payment.find({
        poolId: String(pool._id),
    });
}

async function pay(contract: Contract, payment: PaymentDocument, contractName: TokenContractName) {
    payment.state = PaymentState.Pending;
    await payment.save();

    const txId = await TransactionService.sendAsync(
        contract.options.address,
        contract.methods.transferFrom(payment.sender, payment.receiver, payment.amount),
        payment.chainId,
        true,
        {
            type: 'paymentCallback',
            args: { paymentId: String(payment._id), contractName, address: contract.options.address },
        },
    );

    return Payment.findByIdAndUpdate(payment._id, { transactions: [txId] }, { new: true });
}

async function payCallback(args: TPayCallbackArgs, receipt: TransactionReceipt) {
    const { paymentId, contractName, address } = args;
    const payment = await Payment.findById(paymentId);
    const contract = getContractFromName(payment.chainId, contractName, address);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);

    assertEvent('Transfer', events);

    if (payment.metadataId) {
        // PERFORM THE MINT OF THE NFT
        try {
            const metadata = await ERC721Service.findMetadataById(payment.metadataId);
            const erc721 = await ERC721Service.findById(metadata.erc721);
            const assetPool = await PoolService.getById(payment.poolId);
            const account = await AccountProxy.getByAddress(payment.sender);

            await ERC721Service.mint(assetPool, erc721, metadata, account.sub, account.address);
        } catch (err) {
            logger.error(err);
            throw new Error('ERROR ON MINT AFTER PAYMENT');
        }
    }

    payment.state = PaymentState.Completed;
    await payment.save();
}

function getPaymentUrl(id: string, token: string) {
    return `${WALLET_URL}/payment/${id}?accessToken=${token}`;
}

export default { create, pay, payCallback, get, getPaymentUrl, findByPool };
