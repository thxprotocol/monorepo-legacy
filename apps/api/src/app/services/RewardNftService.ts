import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { RewardVariant } from '../types/enums/RewardVariant';
import { IAccount } from '../models/Account';
import { validateRewardBase, validateCondition, createRewardBase } from './utils/rewards';
import { RewardNft, RewardNftDocument } from '../models/RewardNft';
import { RewardCondition } from '../types/RewardCondition';
import ERC721Service from './ERC721Service';
import { IRewardBaseUpdates, RewardBase, RewardBaseDocument } from '../models/RewardBase';

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
        reward: RewardNftDocument,
        account: IAccount,
    ): Promise<{ result?: boolean; error?: string }> {
        // validate specific fields for rewardBase
        const rewardBase = await reward.rewardBase;
        const validationResult = await validateRewardBase(assetPool, rewardBase as RewardBaseDocument, account);
        if (validationResult.error) {
            return validationResult;
        }

        // Can only claim this reward once, metadata exists, but is not minted
        if (rewardBase.isClaimOnce) {
            const tokensForSub = await ERC721Service.findTokensByMetadataAndSub(reward.erc721metadataId, account);
            if (tokensForSub.length) {
                return { error: 'You have already claimed this NFT' };
            }
            const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);
            const tokens = await ERC721Service.findTokensByMetadata(metadata);

            if (rewardBase.limit > 0 && tokens.length >= rewardBase.limit) {
                return { error: 'This NFT has already been claimed' };
            }
        }

        // Validate reward condition
        if (!reward.rewardConditionId) {
            return { result: true };
        }

        const rewardCondition = await RewardCondition.findById(reward.rewardConditionId);

        return await validateCondition(account, rewardCondition);
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
            isClaimOnce: boolean;
        },
    ) {
        const rewardBase = await createRewardBase(assetPool, RewardVariant.RewardNFT, data);
        return RewardNft.create({
            id: db.createUUID(),
            rewardBaseId: rewardBase.id,
            erc721metadataId: data.erc721metadataId,
            rewardConditionId: data.rewardConditionId,
        });
    }

    static update(reward: RewardNftDocument, updates: IRewardBaseUpdates) {
        return RewardNft.updateOne({ id: reward.id }, updates, { new: true });
    }
}
