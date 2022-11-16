import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { RewardVariant } from '../types/enums/RewardVariant';
import { IRewardBaseUpdates, RewardBase, RewardBaseDocument } from '../types/RewardBase';

import { RewardState } from '../types/enums/RewardState';
import { RewardTokenDocument } from '../models/RewardToken';
import { IAccount } from '../models/Account';
import { canClaim } from './utils/rewards';
import { RewardNft, RewardNftDocument } from '../models/RewardNft';

export default class RewardNftService {
    static async get(id: string): Promise<RewardNftDocument> {
        const rewardNft = await RewardNft.findOne({ id });
        if (!rewardNft) return null;

        return rewardNft;
    }

    static async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const rewardNft = [];
        const results = await paginatedResults(RewardBase, page, limit, {
            poolId: assetPool._id,
            variant: RewardVariant.RewardNFT,
        });

        for (const r of results.results) {
            rewardNft.push(await RewardNft.findOne({ rewardBaseId: r.id }));
        }

        results.results = rewardNft.map((r) => r.toJSON());

        return results;
    }

    static async canClaim(
        assetPool: AssetPoolDocument,
        reward: RewardTokenDocument,
        account: IAccount,
    ): Promise<{ result?: boolean; error?: string }> {
        return canClaim(assetPool, reward.rewardBase as RewardBaseDocument, account);
    }

    static async removeAllForPool(assetPool: AssetPoolDocument) {
        const rewards = await RewardBase.find({ poolId: assetPool._id, variant: RewardVariant.RewardNFT });
        for (const r of rewards) {
            await r.remove();
        }
    }

    static async create(
        assetPool: AssetPoolDocument,
        data: {
            title: string;
            slug: string;
            limit: number;
            expiryDate: Date;
            erc721metadataId: string;
            rewardConditionId?: string;
            amount: number;
        },
    ) {
        const expiryDateObj = data.expiryDate && new Date(data.expiryDate);
        const rewardBase = await RewardBase.create({
            id: db.createUUID(),
            title: data.title,
            slug: data.slug,
            variant: RewardVariant.RewardNFT,
            poolId: assetPool._id,
            limit: data.limit,
            expiryDate: expiryDateObj,
            state: RewardState.Enabled,
            amount: data.amount,
        });
        return RewardNft.create({
            id: db.createUUID(),
            rewardBaseId: rewardBase.id,
            erc721metadataId: data.erc721metadataId,
            rewardConditionId: data.rewardConditionId,
        });
    }

    static update(reward: RewardNftDocument, updates: IRewardBaseUpdates) {
        return RewardNft.findByIdAndUpdate(reward.rewardBaseId, updates, { new: true });
    }
}
