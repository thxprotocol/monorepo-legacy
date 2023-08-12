import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import db from '@thxnetwork/api/util/database';
import { DailyRewardDocument } from '../models/DailyReward';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
import { WalletDocument } from '../models/Wallet';
export const DailyRewardClaimDocument = DailyRewardClaim;

export const ONE_DAY_MS = 86400 * 1000; // 24 hours in milliseconds

async function getLastClaim(wallet: WalletDocument, dailyReward: DailyRewardDocument, start: number, end: number) {
    let lastClaim = await DailyRewardClaim.findOne({
        dailyRewardId: dailyReward._id,
        walletId: wallet._id,
        state: DailyRewardClaimState.Claimed,
        createdAt: { $gt: new Date(start), $lt: new Date(end) },
    });

    if (!lastClaim) {
        lastClaim = await DailyRewardClaim.findOne({
            dailyRewardId: dailyReward._id,
            walletId: wallet._id,
            state: DailyRewardClaimState.Claimed,
            createdAt: { $gt: new Date(start - ONE_DAY_MS), $lt: new Date(end - ONE_DAY_MS) },
        });
    }
    return lastClaim;
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
    findByDailyReward: async (dailyReward: DailyRewardDocument) => {
        return await DailyRewardClaim.find({ dailyRewardId: dailyReward._id });
    },
    findByWallet: async (dailyReward: DailyRewardDocument, wallet: WalletDocument) => {
        const claims = [];
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        let lastClaim = await getLastClaim(wallet, dailyReward, start, end);
        if (!lastClaim) return [];
        claims.push(lastClaim);

        while (lastClaim) {
            const timestamp = new Date(lastClaim.createdAt).getTime();
            lastClaim = await DailyRewardClaim.findOne({
                dailyRewardId: dailyReward._id,
                walletId: wallet._id,
                state: DailyRewardClaimState.Claimed,
                createdAt: {
                    $gt: new Date(timestamp - ONE_DAY_MS * 2),
                    $lt: new Date(timestamp - ONE_DAY_MS),
                },
            });
            if (!lastClaim) break;
            claims.push(lastClaim);
        }

        return claims;
    },
    isClaimable: async (dailyReward: DailyRewardDocument, wallet: WalletDocument) => {
        const now = Date.now(),
            start = now - ONE_DAY_MS,
            end = now;

        const claim = await DailyRewardClaim.findOne({
            dailyRewardId: dailyReward._id,
            walletId: wallet._id,
            // state: DailyRewardClaimState.Claimed,
            createdAt: { $gt: new Date(start), $lt: new Date(end) },
        });
        if (!dailyReward.isEnabledWebhookQualification) return !claim;

        // If webhook qualification is enabled and we have found a claim this means
        // the claim could still be claimed, else if a claim is found the claim could
        // no longer be claimed.
        return claim && claim.state === DailyRewardClaimState.Pending ? true : false;
    },
};
