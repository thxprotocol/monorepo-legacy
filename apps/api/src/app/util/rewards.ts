import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { QuestVariant, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { TERC721Perk } from '@thxnetwork/types/interfaces';
import { ERC20Perk, ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { PerkDocument } from '@thxnetwork/api/services/PerkService';
import { CustomRewardDocument } from '@thxnetwork/api/models/CustomReward';
import { CouponRewardDocument } from '@thxnetwork/api/models/CouponReward';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { DiscordRoleRewardDocument } from '../models/DiscordRoleReward';

export async function findRewardByUuid(uuid: string) {
    const erc20Perk = await ERC20Perk.findOne({ uuid });
    const erc721Perk = await ERC721Perk.findOne({ uuid });
    return erc20Perk || erc721Perk;
}

export function isTERC20Perk(perk: PerkDocument): perk is ERC20PerkDocument {
    return (perk as ERC20PerkDocument).erc20Id !== undefined;
}

export function isTERC721Perk(perk: PerkDocument): perk is ERC721PerkDocument {
    return (perk as ERC721PerkDocument).erc721Id !== undefined || (perk as ERC721PerkDocument).erc1155Id !== undefined;
}

export function isCustomReward(reward: PerkDocument): reward is CustomRewardDocument {
    return (reward as CustomRewardDocument).webhookId !== undefined;
}

export function isCouponReward(reward: PerkDocument): reward is CouponRewardDocument {
    return (reward as CouponRewardDocument).webshopURL !== undefined;
}

export function isDiscordRoleReward(reward: PerkDocument): reward is DiscordRoleRewardDocument {
    return (reward as DiscordRoleRewardDocument).discordRoleId !== undefined;
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

export const createERC721Perk = async (pool: AssetPoolDocument, config: TERC721Perk) => {
    const perk = await ERC721PerkService.create(pool, config);
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
