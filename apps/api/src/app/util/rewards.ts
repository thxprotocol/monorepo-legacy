import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { TERC721Reward, TERC20Reward, TReferralReward } from '@thxnetwork/types/';
import { ERC20Reward } from '../models/ERC20Reward';
import { ERC721Reward } from '../models/ERC721Reward';
import { ReferralReward } from '../models/ReferralReward';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC20RewardService from '../services/ERC20RewardService';
import ERC721RewardService from '@thxnetwork/api/services/ERC721RewardService';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';
import ReferralRewardClaimService from '../services/ReferralRewardClaimService';

export async function findRewardById(rewardId: string) {
    const erc20Reward = await ERC20Reward.findById(rewardId);
    const erc721Reward = await ERC721Reward.findById(rewardId);
    const referralReward = await ReferralReward.findById(rewardId);
    return erc20Reward || erc721Reward || referralReward;
}

export function isTERC20Reward(reward: TERC20Reward | TERC721Reward): reward is TERC20Reward {
    return (reward as TERC20Reward).amount !== undefined;
}

export function isTERC721Reward(reward: TERC20Reward | TERC721Reward): reward is TERC721Reward {
    return (reward as TERC721Reward).erc721metadataId !== undefined;
}

export function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export function subMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() - minutes * 60000);
}

export function formatDate(date: Date) {
    const yyyy = date.getFullYear();
    let mm: any = date.getMonth() + 1; // Months start at 0!
    let dd: any = date.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return yyyy + '-' + mm + '-' + dd;
}

export const createERC721Reward = async (assetPool: AssetPoolDocument, config: TERC721Reward) => {
    const metadata = await ERC721Service.findMetadataById(config.erc721metadataId);
    if (!metadata) throw new NotFoundError('could not find the Metadata for this metadataId');

    const reward = await ERC721RewardService.create(assetPool, config);
    const claims = await Promise.all(
        Array.from({ length: Number(config.claimAmount) }).map(() =>
            ClaimService.create({
                poolId: assetPool._id,
                erc20Id: null,
                erc721Id: metadata.erc721,
                rewardId: String(reward._id),
            }),
        ),
    );

    return { reward, claims };
};

export const createERC20Reward = async (pool: AssetPoolDocument, payload: TERC20Reward) => {
    const reward = await ERC20RewardService.create(pool, payload);
    const claims = await Promise.all(
        Array.from({ length: Number(payload.claimAmount) }).map(() =>
            ClaimService.create({
                poolId: pool._id,
                erc20Id: pool.erc20Id,
                rewardId: String(reward._id),
            }),
        ),
    );

    return { reward, claims };
};
