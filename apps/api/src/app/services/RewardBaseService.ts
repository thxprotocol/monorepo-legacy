import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { IAccount } from '../models/Account';
import { RewardBase, RewardBaseDocument } from '../models/RewardBase';
import { RewardNftDocument } from '../models/RewardNft';
import { RewardReferralDocument } from '../models/RewardReferral';
import { RewardTokenDocument } from '../models/RewardToken';
import { RewardVariant } from '../types/enums/RewardVariant';
import RewardNftService from './RewardNftService';
import RewardReferralService from './RewardReferralService';
import RewardTokenService from './RewardTokenService';

export default class RewardBaseService {
    static async get(assetPool: AssetPoolDocument, rewardId: string): Promise<RewardBaseDocument> {
        const reward = await RewardBase.findOne({ poolId: String(assetPool._id), id: rewardId });
        if (!reward) return null;
        return reward;
    }

    static async removeAllForPool(pool: AssetPoolDocument) {
        const rewards = await RewardBase.find({ poolId: String(pool._id) });
        for (const r of rewards) {
            await r.remove();
        }
    }

    static async canClaim(assetPool: AssetPoolDocument, reward: RewardBaseDocument, account: IAccount) {
        switch (reward.variant) {
            case RewardVariant.RewardNFT: {
                const rewardNft = (await reward.getReward()) as RewardNftDocument;
                return await RewardNftService.canClaim(assetPool, rewardNft, account);
            }
            case RewardVariant.RewardReferral: {
                const rewardReferral = (await reward.getReward()) as RewardReferralDocument;
                return await RewardReferralService.canClaim(assetPool, rewardReferral, account);
            }
            case RewardVariant.RewardToken: {
                const rewardToken = (await reward.getReward()) as RewardTokenDocument;
                return await RewardTokenService.canClaim(assetPool, rewardToken, account);
            }
        }
    }
}
