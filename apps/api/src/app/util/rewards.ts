import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardNFTService from '@thxnetwork/api/services/RewardNFTService';
import {
    RewardCoin,
    RewardCoinDocument,
    RewardNFT,
    RewardNFTDocument,
    PoolDocument,
    RewardDiscordRoleDocument,
    RewardCustomDocument,
    RewardCouponDocument,
} from '@thxnetwork/api/models';

export async function findRewardByUuid(uuid: string) {
    const erc20Perk = await RewardCoin.findOne({ uuid });
    const erc721Perk = await RewardNFT.findOne({ uuid });
    return erc20Perk || erc721Perk;
}

export function isTRewardCoin(perk: TReward): perk is RewardCoinDocument {
    return (perk as RewardCoinDocument).erc20Id !== undefined;
}

export function isTRewardNFT(perk: TReward): perk is RewardNFTDocument {
    return (perk as RewardNFTDocument).erc721Id !== undefined || (perk as RewardNFTDocument).erc1155Id !== undefined;
}

export function isCustomReward(reward: TReward): reward is RewardCustomDocument {
    return (reward as RewardCustomDocument).webhookId !== undefined;
}

export function isCouponReward(reward: TReward): reward is RewardCouponDocument {
    return (reward as RewardCouponDocument).webshopURL !== undefined;
}

export function isDiscordRoleReward(reward: TReward): reward is RewardDiscordRoleDocument {
    return (reward as RewardDiscordRoleDocument).discordRoleId !== undefined;
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

export const createRewardNFT = async (pool: PoolDocument, config: TRewardNFT) => {
    const perk = await RewardNFTService.create(pool, config);
    const claims = await ClaimService.create(
        {
            poolId: config.poolId,
            rewardUuid: perk.uuid,
            erc721Id: config.erc721Id ? config.erc721Id : undefined,
            erc1155Id: config.erc1155Id ? config.erc1155Id : undefined,
        },
        config.claimAmount,
    );
    return { perk, claims };
};
