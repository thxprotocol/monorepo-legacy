import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { RewardVariant } from '../types/enums/RewardVariant';
import { IAccount } from '../models/Account';
import { validateCondition } from '../util/condition';
import { TERC721Reward } from '@thxnetwork/types/';
import { ERC721Reward, ERC721RewardDocument } from '../models/ERC721Reward';
import ERC721Service from './ERC721Service';

export async function get(id: string): Promise<ERC721RewardDocument> {
    const rewardNft = await ERC721Reward.findOne({ id });
    if (!rewardNft) return null;

    return rewardNft;
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const rewards = [];
    const results = await paginatedResults(ERC721Reward, page, limit, {
        poolId: assetPool._id,
        variant: RewardVariant.RewardNFT,
    });

    for (const r of results.results) {
        rewards.push(await ERC721Reward.findOne({ rewardBaseId: r.id }));
    }

    results.results = rewards.map((r) => r.toJSON());

    return results;
}

export async function canClaim(
    reward: TERC721Reward,
    account: IAccount,
): Promise<{ result?: boolean; error?: string }> {
    // Can only claim this reward once, metadata exists, but is not minted
    if (reward.isClaimOnce) {
        const tokensForSub = await ERC721Service.findTokensByMetadataAndSub(reward.erc721metadataId, account);
        if (tokensForSub.length) {
            return { error: 'You have already claimed this NFT' };
        }
        const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);
        const tokens = await ERC721Service.findTokensByMetadata(metadata);

        if (reward.rewardLimit > 0 && tokens.length >= reward.rewardLimit) {
            return { error: 'This NFT has already been claimed' };
        }
    }

    // Validate reward condition
    if (!reward.isConditional) {
        return { result: true };
    }

    return await validateCondition(account, reward);
}

export async function removeAllForPool(pool: AssetPoolDocument) {
    const rewards = await ERC721Reward.find({ poolId: pool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TERC721Reward) {
    return ERC721Reward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        erc721metadataId: payload.erc721metadataId,
        ...payload,
    });
}

export async function update(reward: ERC721RewardDocument, updates: TERC721Reward) {
    await ERC721Reward.updateOne({ _id: reward._id }, updates, { new: true });
    return ERC721Reward.findByIdAndUpdate(reward._id, updates, { new: true });
}

export default { get, canClaim, findByPool, removeAllForPool, create, update };
