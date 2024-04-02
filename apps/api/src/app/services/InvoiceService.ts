import { planPricingMap } from '@thxnetwork/common/constants';
import {
    Pool,
    Invoice,
    QuestDailyEntry,
    QuestInviteEntry,
    QuestSocialEntry,
    QuestCustomEntry,
    QuestWeb3Entry,
    QuestGitcoinEntry,
} from '../models';
import AccountProxy from '../proxies/AccountProxy';
import { logger } from '../util/logger';
import { AccountPlanType } from '@thxnetwork/common/enums';
import { startOfMonth, endOfMonth } from 'date-fns';

export default class InvoiceService {
    /**
     * Upsert invoices for the current month. Periodically (daily) invoked by the agenda job scheduler.
     */
    static async upsertJob() {
        const currentDate = new Date();
        // Define the start and end dates for the month range
        const invoicePeriodstartDate = startOfMonth(currentDate);
        const invoicePeriodEndDate = endOfMonth(currentDate);

        await this.upsertInvoices(invoicePeriodstartDate, invoicePeriodEndDate);
    }

    /**
     * Upsert invoices for a given period. Used independently for testing and backfills.
     * @param invoicePeriodstartDate
     * @param invoicePeriodEndDate
     */
    static async upsertInvoices(invoicePeriodstartDate: Date, invoicePeriodEndDate: Date) {
        // Determine the lookup stages for the quest entries in the pools pipeline
        const questEntryModels = [
            QuestDailyEntry,
            QuestInviteEntry,
            QuestSocialEntry,
            QuestCustomEntry,
            QuestWeb3Entry,
            QuestGitcoinEntry,
        ];

        // Get all relevant pools
        const pools = await Pool.find({ 'settings.isPublished': true });
        const questEntriesByCampaign = await Promise.all(
            pools.map(async (pool) => {
                const uniqueEntriesByVariant = await Promise.all(
                    questEntryModels.map(async (model) => {
                        return await model
                            .countDocuments({
                                poolId: pool.id,
                                createdAt: { $gte: invoicePeriodstartDate, $lte: invoicePeriodEndDate },
                            })
                            .distinct('sub');
                    }),
                );
                const flattenedArray = uniqueEntriesByVariant.flat();

                return { poolId: pool.id, poolSub: pool.sub, mapCount: new Set(flattenedArray).size };
            }),
        );

        // Get the pool owner accounts to send the invoices
        const subs = questEntriesByCampaign.map(({ poolSub }) => poolSub);
        const accounts = await AccountProxy.find({ subs });

        // Build operations array for the current month metrics
        const operations = questEntriesByCampaign.map(({ poolId, poolSub, mapCount }) => {
            try {
                const account = accounts.find((a) => a.sub === poolSub);
                // If the account can not be found, has no email or plan then notify admin.
                // Continue with invoice generation for future reference
                // @todo: notify admin
                if (!account) {
                    logger.info(`Account ${account.sub} not found for invoicing.`);
                }
                if (!account.email) {
                    logger.info(`Account ${account.sub} has no email for invoicing.`);
                }
                if (![AccountPlanType.Lite, AccountPlanType.Premium].includes(account.plan)) {
                    logger.info(`Account ${account.sub} has no plan for invoicing.`);
                }

                return {
                    updateOne: {
                        filter: {
                            poolId,
                            periodStartDate: invoicePeriodstartDate,
                            periodEndDate: invoicePeriodEndDate,
                        },
                        update: {
                            $set: {
                                poolId,
                                periodStartDate: invoicePeriodstartDate,
                                periodEndDate: invoicePeriodEndDate,
                                mapCount,
                                mapLimit: planPricingMap[account.plan].subscriptionLimit,
                                ...this.createInvoiceDetails(account, mapCount),
                            },
                        },
                        upsert: true,
                    },
                };
            } catch (error) {
                logger.error(error);
            }
        });

        // Remove empty ops and bulk write the invoices
        await Invoice.bulkWrite(operations.filter((op) => !!op));
    }

    /**
     * Create invoice details for the given account and monthly active participant count
     * @param account
     * @param mapCount
     * @returns invoice details used for upsert in db
     */
    static createInvoiceDetails(account: TAccount, mapCount: number) {
        const countAdditionalUnits = (mapCount: number, limit: number) => {
            return Math.max(0, mapCount - limit);
        };
        const plan = account.plan || AccountPlanType.Lite;
        const { subscriptionLimit, costPerUnit, costSubscription } = planPricingMap[plan];

        // Plan limit is subtracted from unit count as costs are included in subscription costs
        const additionalUnitCount = countAdditionalUnits(mapCount, subscriptionLimit);

        return {
            additionalUnitCount,
            costPerUnit,
            costSubscription,
            costTotal: costSubscription + additionalUnitCount * costPerUnit,
            currency: 'USDC',
            plan: account.plan,
        };
    }
}
