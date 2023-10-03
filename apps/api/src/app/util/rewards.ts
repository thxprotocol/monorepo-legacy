import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { TERC721Perk } from '@thxnetwork/types/';
import { ERC20Perk, ERC20PerkDocument } from '../models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '../models/ERC721Perk';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import PointRewardService from '../services/PointRewardService';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';
import MilestoneRewardService from '../services/MilestoneRewardService';
import DailyRewardService from '../services/DailyRewardService';
import { PerkDocument } from '../services/PerkService';
import { CustomRewardDocument } from '../models/CustomReward';
import { CouponRewardDocument } from '../models/CouponReward';

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

export async function createDummyContents(pool: AssetPoolDocument) {
    await DailyRewardService.create(pool, {
        title: 'Daily Reward 🗓️',
        description: 'Visit our site on a daily basis to earn some points.',
        index: 0,
        amounts: [5, 10, 20, 40, 80, 160, 360],
    });

    await ReferralRewardService.create(pool, {
        title: 'Tell people about us ❤️',
        description: 'Invite people for a signup and you will receive a point reward after qualification.',
        successUrl: '',
        amount: 500,
        index: 1,
    });

    await PointRewardService.create(pool, {
        title: 'Join our Discord server 🌱',
        description: 'Join our Discord server and claim your points after you obtained verified access.',
        amount: 200,
        index: 2,
    });

    await MilestoneRewardService.create(pool, {
        title: 'Reach a milestone 🏁',
        description: 'Claim points when progressing in the customer journey of external software.',
        amount: 500,
        index: 3,
    });
}
