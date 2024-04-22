import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { Pool, WalletDocument } from '../models';
import { getProvider } from '../util/network';
import { BigNumber } from 'ethers';
import { differenceInSeconds, isBefore, subWeeks } from 'date-fns';
import { getContract } from './ContractService';
import { AccountPlanType, ChainId } from '@thxnetwork/common/enums';
import { Payment } from '../models/Payment';
import { planPricingMap } from '@thxnetwork/common/constants';
import { parseUnits } from 'ethers/lib/utils';
import TransactionService from './TransactionService';
import SafeService from './SafeService';
import BalancerService from './BalancerService';

const ONE_DAY = 60 * 60 * 24;

export default class PaymentService {
    static async deposit(safe: WalletDocument, sub: string, amountInWei: BigNumber) {
        const { web3 } = getProvider(safe.chainId);
        const addresses = contractNetworks[safe.chainId];
        const contract = new web3.eth.Contract(
            contractArtifacts['THXPaymentSplitter'].abi,
            addresses.THXPaymentSplitter,
        );

        // @dev Using default slippage value here as payments
        const { minBPTOut } = await BalancerService.buildJoin(safe, amountInWei.toString(), '0', '50');
        const fn = contract.methods.deposit(safe.address, amountInWei, minBPTOut);

        await Payment.create({ poolId: safe.poolId, sub, amountInWei });

        return await TransactionService.sendSafeAsync(safe, addresses.THXPaymentSplitter, fn);
    }

    static async balanceOf(wallet: WalletDocument) {
        // TODO Deploy Polygon PaymentSplitter before using this middleware
        const { THXPaymentSplitter } = contractNetworks[wallet.chainId];
        if (!THXPaymentSplitter && wallet.chainId === ChainId.Polygon) {
            return '0';
        }

        const splitter = getContract('THXPaymentSplitter', wallet.chainId, THXPaymentSplitter);
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
        // Convert plan pricing to rate in wei per second
        const pricing = planPricingMap[plan];
        // Using 6 decimals for USDC
        const costInWeiPerThirtyDays = parseUnits(pricing.costSubscription.toString(), 6);
        // Plan pricing is determined on a per 4 week basis
        const rateInWeiPerSecond = costInWeiPerThirtyDays.div(4 * 7 * 24 * 60 * 60);
        const fn = contract.methods.setRate(rateInWeiPerSecond);

        return await TransactionService.sendSafeAsync(safe, addresses.PaymentSplitter, fn);
    }

    static async getTimeLeftInSeconds(safe: WalletDocument, pool: TPool) {
        const now = new Date();
        const isTrial = isBefore(pool.trialEndsAt, now);
        if (isTrial) return BigNumber.from(differenceInSeconds(pool.trialEndsAt, now));

        // Devide balance by rate and calculate time left for the pool
        const balanceInWei = await this.balanceOf(safe);
        const rateInWeiPerSecond = await this.getRate(safe);
        return BigNumber.from(balanceInWei).div(rateInWeiPerSecond);
    }

    static async assertPaymentsJob() {
        // Skip pools that have no trialEnd date (legacy) or are still in the first week of their trial
        const pools = await Pool.find({ trialEndsAt: { $exists: true, $lt: subWeeks(new Date(), 1) } });
        for (const pool of pools) {
            // Get campaing safe
            const safe = await SafeService.findOneByPool(pool);
            const timeLeftInSeconds = await this.getTimeLeftInSeconds(safe, pool);

            // Insufficient payments
            if (timeLeftInSeconds.eq(0)) {
                // Send a reminder to make payment and inform about campaign pause change
            }
            // 1 day before balance hitting zero send a reminder to make payment
            else if (timeLeftInSeconds.lt(ONE_DAY)) {
                // Send reminder to make payment
            }
            // 3 days before balance hitting zero send a reminder to make payment
            else if (timeLeftInSeconds.lt(ONE_DAY * 3)) {
                // Send reminder to make payment
            }
            // 1 week before balance hitting zero send a reminder to make payment
            else if (timeLeftInSeconds.lt(ONE_DAY * 7)) {
                // Send reminder to make payment
            }
        }
    }
}
