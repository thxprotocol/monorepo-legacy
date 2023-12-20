import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import db from '@thxnetwork/api/util/database';
import { DailyRewardDocument } from '../models/DailyReward';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
import { WalletDocument } from '../models/Wallet';
import { Event } from '../models/Event';
import { Identity } from '../models/Identity';
export const DailyRewardClaimDocument = DailyRewardClaim;

export const ONE_DAY_MS = 86400 * 1000; // 24 hours in milliseconds

async function getLastEntry(wallet: WalletDocument, quest: DailyRewardDocument, start: number, end: number) {
    let lastEntry = await DailyRewardClaim.findOne({
        dailyRewardId: quest._id,
        walletId: wallet._id,
        createdAt: { $gt: new Date(start), $lt: new Date(end) },
    });

    if (!lastEntry) {
        lastEntry = await DailyRewardClaim.findOne({
            dailyRewardId: quest._id,
            walletId: wallet._id,
            createdAt: { $gt: new Date(start - ONE_DAY_MS), $lt: new Date(end - ONE_DAY_MS) },
        });
    }
    return lastEntry;
}

export default {
    create: (data: {
        dailyRewardId: string;
        sub: string;
        walletId: string;
        amount?: number;
        poolId: string;
        state?: DailyRewardClaimState;
    }) => {
        return DailyRewardClaim.create({ uuid: db.createUUID(), ...data });
    },
    findByUUID: (uuid: string) => {
        return DailyRewardClaim.findOne({ uuid });
    },
    findByDailyReward: async (quest: DailyRewardDocument) => {
        return await DailyRewardClaim.find({ dailyRewardId: quest._id });
    },
    findByWallet: async (quest: DailyRewardDocument, wallet: WalletDocument) => {
        const claims = [];
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        let lastEntry = await getLastEntry(wallet, quest, start, end);
        if (!lastEntry) return [];
        claims.push(lastEntry);

        while (lastEntry) {
            const timestamp = new Date(lastEntry.createdAt).getTime();
            lastEntry = await DailyRewardClaim.findOne({
                dailyRewardId: quest._id,
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
    },
    isClaimable: async (quest: DailyRewardDocument, wallet: WalletDocument) => {
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        const entry = await DailyRewardClaim.findOne({
            dailyRewardId: quest._id,
            walletId: wallet._id,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });
        //If no event is required and no entry is found the entry is allowed to be created
        if (!quest.eventName) return !entry;

        // If an event is required we check if there is an event found within the time window
        const identity = await Identity.findOne({ sub: wallet.sub, poolId: quest.poolId });
        const events = await Event.find({
            name: quest.eventName,
            poolId: quest.poolId,
            identityId: identity._id,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });

        return !entry && events.length ? true : false;
    },
};
