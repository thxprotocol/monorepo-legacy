import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { DailyRewardClaim } from '../models/DailyRewardClaims';
import { WalletDocument } from '../models/Wallet';
import { Event } from '../models/Event';
import { TDailyReward, TAccount, TDailyRewardClaim, TValidationResult } from '@thxnetwork/common/lib/types';
import { Identity } from '../models/Identity';
import { IQuestService } from './interfaces/IQuestService';

const ONE_DAY_MS = 86400 * 1000; // 24 hours in milliseconds

export default class QuestDailyService implements IQuestService {
    models = {
        quest: DailyReward,
        entry: DailyRewardClaim,
    };

    async decorate({
        quest,
        wallet,
        account,
    }: {
        quest: TDailyReward;
        wallet?: WalletDocument;
        account?: TAccount;
    }): Promise<
        TDailyReward & {
            isAvailable: boolean;
            amount: number;
            entries: TDailyRewardClaim[];
            claimAgainDuration: number;
        }
    > {
        const amount = await this.getAmount({ quest, wallet, account });
        const entries = wallet ? await this.findEntries({ quest, wallet }) : [];
        const claimAgainTime = entries.length ? new Date(entries[0].createdAt).getTime() + ONE_DAY_MS : null;
        const now = Date.now();
        const isAvailable = await this.isAvailable({ quest, wallet, account });

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
        wallet,
    }: {
        quest: TDailyReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<TValidationResult> {
        if (!wallet) return { result: true, reason: '' };

        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        const isCompleted = await DailyRewardClaim.findOne({
            questId: quest._id,
            walletId: wallet._id,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest within the last 24 hours.' };
    }

    async getAmount({
        quest,
        wallet,
    }: {
        quest: TDailyReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<number> {
        if (!wallet) return quest.amounts[0];

        const claims = await this.findEntries({ quest, wallet });
        const amountIndex =
            claims.length >= quest.amounts.length ? claims.length % quest.amounts.length : claims.length;
        return quest.amounts[amountIndex];
    }

    async getValidationResult({
        quest,
        wallet,
    }: {
        quest: TDailyReward;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TDailyRewardClaim>;
    }): Promise<TValidationResult> {
        const identities = await Identity.find({ sub: wallet.sub, poolId: quest.poolId });
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        const entry = await DailyRewardClaim.findOne({
            questId: quest._id,
            walletId: wallet._id,
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
        const identityIds = identities.map(({ _id }) => String(_id));
        const events = await Event.find({
            name: quest.eventName,
            poolId: quest.poolId,
            identityId: identityIds,
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

    private async findEntries({ wallet, quest }: { wallet: WalletDocument; quest: TDailyReward }) {
        const claims = [];
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        let lastEntry = await this.getLastEntry(wallet, quest, start, end);
        if (!lastEntry) return [];
        claims.push(lastEntry);

        while (lastEntry) {
            const timestamp = new Date(lastEntry.createdAt).getTime();
            lastEntry = await DailyRewardClaim.findOne({
                questId: quest._id,
                walletId: wallet._id,
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

    private async getLastEntry(wallet: WalletDocument, quest: TDailyReward, start: number, end: number) {
        let lastEntry = await DailyRewardClaim.findOne({
            questId: quest._id,
            walletId: wallet._id,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });

        if (!lastEntry) {
            lastEntry = await DailyRewardClaim.findOne({
                questId: quest._id,
                walletId: wallet._id,
                createdAt: { $gt: new Date(start - ONE_DAY_MS), $lt: new Date(end - ONE_DAY_MS) },
            });
        }
        return lastEntry;
    }
}
