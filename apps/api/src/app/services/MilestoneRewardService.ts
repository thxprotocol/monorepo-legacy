import { NotFoundError } from '@thxnetwork/api/util/errors';
import db from '@thxnetwork/api/util/database';
import { TMilestoneReward } from '@thxnetwork/types/index';
import { AssetPoolDocument } from '../models/AssetPool';
import { MilestoneReward } from '../models/MilestoneReward';
import { paginatedResults } from '../util/pagination';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import { Wallet } from './WalletService';
import { WalletDocument } from '../models/Wallet';

export default {
    async create(pool: AssetPoolDocument, payload: Partial<TMilestoneReward>) {
        return await MilestoneReward.create({
            poolId: String(pool._id),
            uuid: db.createUUID(),
            ...payload,
        });
    },

    async edit(uuid: string, payload: Partial<TMilestoneReward>) {
        const reward = await MilestoneReward.findById(uuid);
        if (!reward) throw new NotFoundError('Cannot find Milestone Perk with this UUID');

        Object.keys(payload).forEach((key) => {
            if (payload[key]) reward[key] = payload[key];
        });

        await reward.save();
        return reward;
    },

    async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const result = await paginatedResults(MilestoneReward, page, limit, {
            poolId: assetPool._id,
        });
        result.results = result.results.map((r) => r.toJSON());
        return result;
    },

    async updateWalletId(wallet: WalletDocument, sub: string) {
        if (!sub) return;
        // Find a wallet for this sub with an address
        const walletWithAddress = await Wallet.findOne({ sub, address: { $exists: true } });

        // If found update all milestone reward claims for that walletId
        console.log({ walletId: wallet._id }, { walletId: walletWithAddress._id });

        await MilestoneRewardClaim.updateMany(
            { walletId: String(wallet._id), isClaimed: false },
            { walletId: String(walletWithAddress._id) },
        );
    },
};
