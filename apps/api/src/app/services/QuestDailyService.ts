import { Event, Identity, QuestDaily, QuestDailyEntry } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';

const ONE_DAY_MS = 86400 * 1000; // 24 hours in milliseconds

export default class QuestDailyService implements IQuestService {
    models = {
        quest: QuestDaily,
        entry: QuestDailyEntry,
    };

    async findEntryMetadata({ quest }: { quest: TQuestDaily }) {
        const uniqueParticipantIds = await this.models.entry
            .countDocuments({
                questId: String(quest._id),
            })
            .distinct('sub');

        return { participantCount: uniqueParticipantIds.length };
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: TQuestDaily;
        data: Partial<TQuestDailyEntry>;
        account?: TAccount;
    }): Promise<
        TQuestDaily & {
            isAvailable: boolean;
            amount: number;
            entries: TQuestDailyEntry[];
            claimAgainDuration: number;
        }
    > {
        const amount = await this.getAmount({ quest, account });
        const entries = account ? await this.findEntries({ quest, account }) : [];
        const claimAgainTime = entries.length ? new Date(entries[0].createdAt).getTime() + ONE_DAY_MS : null;
        const now = Date.now();
        const isAvailable = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            amount,
            entries,
            claimAgainDuration:
                claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert and floor to S,
        };
    }

    async isAvailable({
        quest,
        account,
        data,
    }: {
        quest: TQuestDaily;
        account: TAccount;
        data: Partial<TQuestDailyEntry>;
    }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };

        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        // Check for IP as we limit to 1 per IP per day (if an ip is passed)
        if (data.metadata && data.metadata.ip) {
            const isCompletedForIP = !!(await QuestDailyEntry.exists({
                'questId': quest._id,
                'createdAt': { $gt: new Date(start), $lt: new Date(end) },
                'metadata.ip': data.metadata.ip,
            }));
            if (isCompletedForIP) {
                return {
                    result: false,
                    reason: 'You have completed this quest from this IP within the last 24 hours.',
                };
            }
        }

        const isCompleted = await QuestDailyEntry.findOne({
            questId: quest._id,
            sub: account.sub,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest within the last 24 hours.' };
    }

    async getAmount({ quest, account }: { quest: TQuestDaily; account: TAccount }): Promise<number> {
        if (!account) return quest.amounts[0];

        const claims = await this.findEntries({ quest, account });
        const amountIndex =
            claims.length >= quest.amounts.length ? claims.length % quest.amounts.length : claims.length;
        return quest.amounts[amountIndex];
    }

    async getValidationResult({
        quest,
        account,
    }: {
        quest: TQuestDaily;
        account: TAccount;
        data: Partial<TQuestDailyEntry>;
    }): Promise<TValidationResult> {
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        const entry = await QuestDailyEntry.findOne({
            questId: quest._id,
            sub: account.sub,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });

        // If an entry has been found the user needs to wait
        if (entry) {
            return { result: false, reason: `Already completed within the last 24 hours.` };
        }

        // If no entry has been found and no event is required the entry is allowed to be created
        if (!quest.eventName) {
            return { result: true, reason: '' };
        }

        // If an event is required we check if there is an event found within the time window
        const identities = await this.findIdentities({ quest, account });
        if (!identities.length) {
            return {
                result: false,
                reason: 'No identity connected to this account. Please ask for this in your community!',
            };
        }

        const identityIds = identities.map(({ _id }) => String(_id));
        const events = await Event.find({
            name: quest.eventName,
            poolId: quest.poolId,
            identityId: { $in: identityIds },
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });

        // If no events are found we invalidate
        if (!events.length) {
            return { result: false, reason: 'No events found for this account' };
        }

        // If events are found we validate true
        else {
            return { result: true, reason: '' };
        }
    }

    private async findIdentities({ quest, account }: { quest: TQuestDaily; account: TAccount }) {
        return await Identity.find({ sub: account.sub, poolId: quest.poolId });
    }

    private async findEntries({ account, quest }: { account: TAccount; quest: TQuestDaily }) {
        const claims = [];
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        let lastEntry = await this.getLastEntry(account, quest, start, end);
        if (!lastEntry) return [];
        claims.push(lastEntry);

        while (lastEntry) {
            const timestamp = new Date(lastEntry.createdAt).getTime();
            lastEntry = await QuestDailyEntry.findOne({
                questId: quest._id,
                sub: account.sub,
                createdAt: {
                    $gt: new Date(timestamp - ONE_DAY_MS * 2),
                    $lt: new Date(timestamp - ONE_DAY_MS),
                },
            });
            if (!lastEntry) break;
            claims.push(lastEntry);
        }

        return claims;
    }

    private async getLastEntry(account: TAccount, quest: TQuestDaily, start: number, end: number) {
        let lastEntry = await QuestDailyEntry.findOne({
            questId: quest._id,
            sub: account.sub,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });

        if (!lastEntry) {
            lastEntry = await QuestDailyEntry.findOne({
                questId: quest._id,
                sub: account.sub,
                createdAt: { $gt: new Date(start - ONE_DAY_MS), $lt: new Date(end - ONE_DAY_MS) },
            });
        }
        return lastEntry;
    }
}
