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

export default class InvoiceService {
    /**
     * Upsert invoices for the current month. Periodically (daily) invoked by the agenda job scheduler.
     */
    static async upsertJob() {
        const currentDate = new Date();
        // Define the start and end dates for the month range
        const invoicePeriodstartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const invoicePeriodEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

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
        const questEntryLookupStages = questEntryModels.map((model) => {
            return {
                $lookup: {
                    from: model.collection.name,
                    localField: 'id',
                    foreignField: 'poolId',
                    as: model.collection.name,
                },
            };
        });

        // Aggregate the pipeline for the given month
        const questEntriesByCampaign = await Pool.aggregate([
            {
                $addFields: {
                    id: { $toString: '$_id' },
                },
            },
            ...questEntryLookupStages,
            {
                $addFields: {
                    allQuestEntries: {
                        $concatArrays: questEntryModels.map((model) => `$${model.collection.name}`),
                    },
                },
            },
            {
                $match: {
                    $or: questEntryModels.map((model) => ({
                        [`${model.collection.name}.createdAt`]: {
                            $gte: invoicePeriodstartDate,
                            $lte: invoicePeriodEndDate,
                        },
                    })),
                },
            },
        ]).exec();

        // Count the amount of distinct subs for the list of quest entries
        const mapCounts = questEntriesByCampaign.map((pool) => {
            const distinctSubs: Set<string> = new Set();
            pool.allQuestEntries.forEach((quest) => {
                distinctSubs.add(quest.sub);
            });
            return { sub: pool.sub, poolId: pool.id, mapCount: distinctSubs.size };
        });

        // Get the pool owner accounts to send the invoices
        const subs = questEntriesByCampaign.map((campaign) => campaign.sub);
        const accounts = await AccountProxy.find({ subs });

        // Build operations array for the current month metrics
        const operations = mapCounts.map(({ sub, poolId, mapCount }) => {
            try {
                const account = accounts.find((a) => a.sub === sub);
                console.log({ account });

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
                            poolId: poolId,
                            periodStartDate: invoicePeriodstartDate,
                            periodEndDate: invoicePeriodEndDate,
                        },
                        update: {
                            $set: {
                                poolId: poolId,
                                periodStartDate: invoicePeriodstartDate,
                                periodEndDate: invoicePeriodEndDate,
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
