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
            // QuestDailyEntry, // Temporary disabled due to botting issues
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
            ...questEntryLookupStages,
            {
                $addFields: {
                    allQuestEntries: {
                        $concatArrays: questEntryModels.map((model) => `$${model.collection.name}`),
                    },
                },
            },
            {
                $unwind: '$allQuestEntries', // Deconstruct the allQuestEntries array
            },
            {
                $group: {
                    _id: {
                        poolId: '$_id', // Group by pool._id
                        sub: '$allQuestEntries.sub', // Group by the "sub" field
                        poolSub: '$sub', // Include pool.sub value
                    },
                },
            },
            {
                $group: {
                    _id: '$_id.poolId', // Group by pool._id
                    poolSub: { $first: '$_id.poolSub' }, // Store the pool.sub value
                    mapCount: { $sum: 1 }, // Count the distinct values
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field from the result
                    poolId: { $toString: '$_id' }, // Include pool._id as string
                    poolSub: 1, // Include the pool.sub value
                    mapCount: 1, // Include the count field
                },
            },
        ]).exec();

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
