import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { TERC721Perk, TERC20Perk, TPointReward } from '@thxnetwork/types/';
import { ERC20Perk } from '../models/ERC20Perk';
import { ERC721Perk } from '../models/ERC721Perk';
import { ReferralReward } from '../models/ReferralReward';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC20PerkService from '../services/ERC20PerkService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import { PointReward } from '../models/PointReward';
import PointRewardService from '../services/PointRewardService';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';
import MilestoneRewardService from '../services/MilestoneRewardService';
import axios from 'axios';
import { API_URL, MILESTONETOKENS } from '../config/secrets';
import WalletService from '../services/WalletService';
import { logger } from '@thxnetwork/api/util/logger';

export async function findRewardByUuid(uuid: string) {
    const erc20Perk = await ERC20Perk.findOne({ uuid });
    const erc721Perk = await ERC721Perk.findOne({ uuid });
    const referralReward = await ReferralReward.findOne({ uuid });
    const pointReward = await PointReward.findOne({ uuid });

    return erc20Perk || erc721Perk || referralReward || pointReward;
}

export function isTERC20Perk(reward: TERC20Perk | TERC721Perk | TPointReward): reward is TERC20Perk {
    return (reward as TERC20Perk).amount !== undefined;
}

export function isTERC721Perk(reward: TERC20Perk | TERC721Perk | TPointReward): reward is TERC721Perk {
    return (reward as TERC721Perk).erc721metadataId !== undefined;
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
                erc721Id: metadata.erc721,
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
    await ReferralRewardService.create(pool, {
        title: 'My first Referral Reward',
        description: 'a reward that can be claimed when a new user signs up',
        successUrl: '',
        amount: '1',
    });

    await PointRewardService.create(pool, {
        title: 'My First Conditional Reward',
        description: 'a reward that can be claimed on certain conditions',
        amount: '1',
    });

    await MilestoneRewardService.create(pool, {
        title: 'My first Milestone Reward',
        description: 'a reward that can be claimed after all the milestones are completed',
        amount: 1,
    });
}

export async function claimConfiguredMilestoneRewards(pool: AssetPoolDocument) {
    try {
        const milestoneTokens = MILESTONETOKENS.split(',');
        if (!milestoneTokens.length) {
            throw new Error('Milestone config is Empty');
        }
        const wallets = await WalletService.findByQuery({ sub: pool.sub, chainId: pool.chainId });
        if (!wallets.length) {
            throw new NotFoundError('Could not find the wallet');
        }
        for (let i = 0; i < milestoneTokens.length; i++) {
            await axios({
                url: `${API_URL}/v1/webhook/milestone/${milestoneTokens[i]}/claim`,
                method: 'POST',
                data: {
                    address: wallets[0].address,
                },
            });
        }
    } catch (err) {
        logger.error(err);
    }
}
