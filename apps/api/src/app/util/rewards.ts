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
import { ShopifyPerkDocument } from '../models/ShopifyPerk';
import { ONE_DAY_MS } from '../services/DailyRewardClaimService';

export async function findRewardByUuid(uuid: string) {
    const erc20Perk = await ERC20Perk.findOne({ uuid });
    const erc721Perk = await ERC721Perk.findOne({ uuid });

    return erc20Perk || erc721Perk;
}

export function isTERC20Perk(
    perk: ERC20PerkDocument | ERC721PerkDocument | ShopifyPerkDocument,
): perk is ERC20PerkDocument {
    return (perk as ERC20PerkDocument).erc20Id !== undefined;
}

export function isTERC721Perk(
    perk: ERC20PerkDocument | ERC721PerkDocument | ShopifyPerkDocument,
): perk is ERC721PerkDocument {
    return (perk as ERC721PerkDocument).erc721Id !== undefined || (perk as ERC721PerkDocument).erc1155Id !== undefined;
}

export function isTShopifyPerk(
    perk: ERC20PerkDocument | ERC721PerkDocument | ShopifyPerkDocument,
): perk is ERC721PerkDocument {
    return (perk as ShopifyPerkDocument).discountCode !== undefined;
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
    const claims = await Promise.all(
        Array.from({ length: Number(config.claimAmount) }).map(async () => {
            return await ClaimService.create({
                poolId: config.poolId,
                rewardUuid: perk.uuid,
                erc721Id: config.erc721Id ? config.erc721Id : undefined,
                erc1155Id: config.erc1155Id ? config.erc1155Id : undefined,
            });
        }),
    );
    return { perk, claims };
};

export async function createDummyContents(pool: AssetPoolDocument) {
    await DailyRewardService.create(pool, {
        title: 'Daily Reward 🗓️',
        description: 'Visit our site on a daily basis to earn some points.',
        amounts: [15],
    });

    await ReferralRewardService.create(pool, {
        title: 'Tell people about us ❤️',
        description: 'Invite people for a signup and you will receive a point reward after qualification.',
        successUrl: '',
        amount: 500,
    });

    await PointRewardService.create(pool, {
        title: 'Retweet our latest highlight 🦜',
        description: 'Grab the highlight and retweet! Sharing is caring.',
        amount: 25,
    });

    await PointRewardService.create(pool, {
        title: 'Order with us 🛍️',
        description: 'Spend a minimum amount of 50 EUR to earn points that you can redeem for discount perks.',
        amount: 500,
    });

    await PointRewardService.create(pool, {
        title: 'Free points for you 🥳',
        description: 'Celebrate the loyalty widget launch with us!',
        amount: 250,
    });

    await PointRewardService.create(pool, {
        title: 'Like our YouTube content 🎥',
        description: 'Watch and like our latest content!',
        amount: 250,
    });

    await PointRewardService.create(pool, {
        title: 'Join our Discord server 🌱',
        description: 'Join our Discord server and claim your points after you obtained verified access.',
        amount: 200,
    });

    await MilestoneRewardService.create(pool, {
        title: 'Reach a milestone 🏁',
        description: 'Claim points when progressing in the customer journey of external software.',
        amount: 500,
    });

    await MilestoneRewardService.create(pool, {
        title: 'First referral reward claimed ✨',
        description: 'Have your audience earn a referral reward.',
        amount: 400,
    });

    await ERC20Perk.create({
        title: 'A small bag of $THX',
        description: 'Have your audience earn a referral reward.',
        amount: 50,
        pointPrice: 500,
        limit: 10,
        expiryDate: new Date(Date.now() + ONE_DAY_MS * 14),
    });
}
