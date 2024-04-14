import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { Pool, WalletDocument } from '../models';
import { getProvider } from '../util/network';
import { BigNumber } from 'ethers';
import { subWeeks } from 'date-fns';
import { getContract } from './ContractService';
import { AccountPlanType } from '@thxnetwork/common/enums';
import TransactionService from './TransactionService';
import SafeService from './SafeService';
export default class PaymentService {
    static async deposit(safe: WalletDocument, sub: string, amountInWei: BigNumber) {
        const { web3 } = getProvider(safe.chainId);
        const addresses = contractNetworks[safe.chainId];
        const contract = new web3.eth.Contract(
            contractArtifacts['THXPaymentSplitter'].abi,
            addresses.THXPaymentSplitter,
        );
        const fn = contract.methods.deposit(safe.address, amountInWei.toString());

        // await Payment.create({ poolId: safe.poolId, sub, amountInWei });

        return await TransactionService.sendSafeAsync(safe, addresses.THXPaymentSplitter, fn);
    }

    static async assertPaymentsJob() {
        // Skip pools that have no trialEnd date (legacy) or are still in the first week of their trial
        const pools = await Pool.find({ trialEndsAt: { $exists: true, $lt: subWeeks(new Date(), 1) } });
        for (const pool of pools) {
            const safe = await SafeService.findOneByPool(pool);
            // Find out when the last payment was made (query contract)
            //
            // Find out if the pool still has a balance
            const balanceInWei = await this.balanceOf(safe);
            // Devide balance by rate and calculate time left for the pool
            // 1 week before balance hitting zero send a reminder to make payment
            // 3 days before balance hitting zero send a reminder to make payment
            // 1 day before balance hitting zero send a reminder to make payment
            // On the day balance hits zero send a reminder to make payment and inform about campaign pause change
            // 1 day after balance hits zero inform about campaign participation attempts and payment to be made
        }
    }

    static async balanceOf(wallet: WalletDocument) {
        const splitter = getContract(
            'THXPaymentSplitter',
            wallet.chainId,
            contractNetworks[wallet.chainId].THXPaymentSplitter,
        );
        const balance = await splitter.balanceOf(wallet.address);
        return balance.toString();
    }

    static async getRate(wallet: WalletDocument) {
        const splitter = getContract(
            'THXPaymentSplitter',
            wallet.chainId,
            contractNetworks[wallet.chainId].THXPaymentSplitter,
        );
        const rate = await splitter.rates(wallet.address);
        return rate.toString();
    }

    static async setRate(safe: WalletDocument, plan: AccountPlanType) {
        const { web3 } = getProvider(safe.chainId);
        const addresses = contractNetworks[safe.chainId];
        const contract = new web3.eth.Contract(
            contractArtifacts['THXPaymentSplitter'].abi,
            addresses.THXPaymentSplitter,
        );

        // Convert plan to rps
        const rateInWeiPerSecond = '192';
        const fn = contract.methods.setRate(rateInWeiPerSecond);

        return await TransactionService.sendSafeAsync(safe, addresses.PaymentSplitter, fn);
    }
}
