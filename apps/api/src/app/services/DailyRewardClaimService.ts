import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import db from '@thxnetwork/api/util/database';
import { DailyRewardDocument } from '../models/DailyReward';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
import { WalletDocument } from '../models/Wallet';
export const DailyRewardClaimDocument = DailyRewardClaim;

export const ONE_DAY_MS = 86400 * 1000; // 24 hours in milliseconds

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
        return await DailyRewardClaim.find({
            dailyRewardId: dailyReward._id,
            walletId: wallet._id,
            state: DailyRewardClaimState.Claimed,
        });
    },
    isClaimable: async (dailyReward: DailyRewardDocument, wallet: WalletDocument) => {
        const claim = await DailyRewardClaim.findOne({
            walletId: wallet._id,
            poolId: dailyReward.poolId,
            dailyRewardId: dailyReward._id,
            createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
        });
        if (!dailyReward.isEnabledWebhookQualification) return !claim;

        // If webhook qualification is enabled and we have found a claim this means
        // the claim could still be claimed, else if a claim is found the claim could
        // no longer be claimed.
        return claim && claim.state === DailyRewardClaimState.Pending ? true : false;
    },
};
