import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { TERC721Perk, TERC20Perk } from '@thxnetwork/types/';
import { ERC20Perk, ERC20PerkDocument } from '../models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '../models/ERC721Perk';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC20PerkService from '../services/ERC20PerkService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import PointRewardService from '../services/PointRewardService';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';
import MilestoneRewardService from '../services/MilestoneRewardService';
import DailyRewardService from '../services/DailyRewardService';

export async function findRewardByUuid(uuid: string) {
    const erc20Perk = await ERC20Perk.findOne({ uuid });
    const erc721Perk = await ERC721Perk.findOne({ uuid });

    return erc20Perk || erc721Perk;
}

export function isTERC20Perk(perk: ERC20PerkDocument | ERC721PerkDocument): perk is ERC20PerkDocument {
    return (perk as ERC20PerkDocument).amount !== undefined;
}

export function isTERC721Perk(perk: ERC20PerkDocument | ERC721PerkDocument): perk is ERC721PerkDocument {
    return (perk as ERC721PerkDocument).erc721metadataId !== undefined;
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

export const createERC721Perk = async (assetPool: AssetPoolDocument, config: TERC721Perk) => {
    const metadata = await ERC721Service.findMetadataById(config.erc721metadataId);
    if (!metadata) throw new NotFoundError('could not find the Metadata for this metadataId');

    const reward = await ERC721PerkService.create(assetPool, config);
    const claims = await Promise.all(
        Array.from({ length: Number(config.claimAmount) }).map(() =>
            ClaimService.create({
                poolId: assetPool._id,
                erc721Id: metadata.erc721Id,
                rewardUuid: reward.uuid,
            }),
        ),
    );

    return { reward, claims };
};

export const createERC20Perk = async (pool: AssetPoolDocument, payload: TERC20Perk) => {
    const reward = await ERC20PerkService.create(pool, payload);
    const claims = await Promise.all(
        Array.from({ length: Number(payload.claimAmount) }).map(() =>
            ClaimService.create({
                poolId: pool._id,
                erc20Id: payload.erc20Id,
                rewardUuid: reward.uuid,
            }),
        ),
    );

    return { reward, claims };
};

export async function createDummyContents(pool: AssetPoolDocument) {
    await DailyRewardService.create(pool, {
        title: 'Daily Reward 🗓️',
        description: 'Return every 24h to claim your poin reward.',
        amount: 15,
    });

    await ReferralRewardService.create(pool, {
        title: 'Spread the word! ❤️',
        description: 'Let your customers earn points by referring people to your site.',
        successUrl: '',
        amount: 250,
    });

    await PointRewardService.create(pool, {
        title: 'Engage in our social 💬',
        description: 'Set social conditions for people to meet when claiming points.',
        amount: 50,
    });

    await MilestoneRewardService.create(pool, {
        title: 'Reach a milestone 🏁',
        description: 'Claim points when progressing in the customer journey of external software.',
        amount: 15,
    });
}
