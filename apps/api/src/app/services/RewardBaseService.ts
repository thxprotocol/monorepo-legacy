import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import db from '@thxnetwork/api/util/database';
import { IRewardBaseUpdates, RewardBase, RewardBaseDocument } from '../types/RewardBase';
import { RewardState } from '../types/enums/RewardState';
import { RewardVariant } from '../types/enums/RewardVariant';

export default class RewardBaseService {
    static async get(assetPool: AssetPoolDocument, rewardId: string): Promise<RewardBaseDocument> {
        const reward = await RewardBase.findOne({ poolId: String(assetPool._id), id: rewardId });
        if (!reward) return null;
        return reward;
    }

    static async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const rewards = [];

        const results = await paginatedResults(RewardBase, page, limit, { poolId: String(assetPool._id) });

        for (const r of results.results) {
            rewards.push(await this.get(assetPool, r.id));
        }

        results.results = rewards.map((r) => r.toJSON());

        return results;
    }

    static async removeAllForPool(pool: AssetPoolDocument) {
        const rewards = await RewardBase.find({ poolId: String(pool._id) });
        for (const r of rewards) {
            await r.remove();
        }
    }

    static async create(
        assetPool: AssetPoolDocument,
        data: {
            title: string;
            slug: string;
            variant: RewardVariant;
            poolId: string;
            limit: number;
            expiryDate: Date;
        },
    ) {
        const expiryDateObj = data.expiryDate && new Date(data.expiryDate);
        return RewardBase.create({
            title: data.title,
            slug: data.slug,
            expiryDate: expiryDateObj,
            poolId: String(assetPool._id),
            limit: data.limit,
            state: RewardState.Enabled,
            id: db.createUUID(),
        });
    }

    static update(reward: RewardBaseDocument, updates: IRewardBaseUpdates) {
        return RewardBase.findByIdAndUpdate(reward._id, updates, { new: true });
    }
}
