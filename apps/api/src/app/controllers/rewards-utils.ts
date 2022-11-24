import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { agenda, EVENT_SEND_DOWNLOAD_QR_EMAIL } from '@thxnetwork/api/util/agenda';
import { AWS_S3_PRIVATE_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { s3PrivateClient } from '@thxnetwork/api/util/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { TERC721Reward, TERC20Reward, TBaseReward, TReferralReward } from '@thxnetwork/types/';
import { Readable } from 'stream';
import { logger } from '@thxnetwork/api/util/logger';
import { Response } from 'express';
import { ERC20Reward, ERC20RewardDocument } from '../models/ERC20Reward';
import { ERC721Reward, ERC721RewardDocument } from '../models/ERC721Reward';
import { ReferralReward, ReferralRewardDocument } from '../models/ReferralReward';
import { IAccount } from '../models/Account';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import RewardNftService from '@thxnetwork/api/services/ERC721RewardService';
import ERC20RewardService from '../services/ERC20RewardService';
import ERC721RewardService from '@thxnetwork/api/services/ERC721RewardService';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';

export async function canClaimReward(pool: AssetPoolDocument, reward: TBaseReward, account: IAccount) {
    if (isTERC20Reward(reward)) {
        return await ERC20RewardService.canClaim(pool, reward, account);
    }
    if (isTERC721Reward(reward)) {
        return await ERC721RewardService.canClaim(reward, account);
    }
}

export async function findRewardById(rewardId: string) {
    const erc20Reward = await ERC20Reward.findById(rewardId);
    const erc721Reward = await ERC721Reward.findById(rewardId);
    const referralReward = await ReferralReward.findById(rewardId);
    return erc20Reward || erc721Reward || referralReward;
}

export function isTERC20Reward(r: any): r is TERC20Reward {
    return;
}

export function isTERC721Reward(r: any): r is TERC721Reward {
    return;
}

export function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
}

export function minusMinutes(date: Date, minutes: number) {
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

export function getERC20RewardConfiguration(slug: RewardSlug) {
    switch (slug) {
        case 'no-limit-and-claim-one-disabled': {
            return {
                title: 'No limit and claim one disabled',
                slug: 'no-limit-and-claim-one-disabled',
                withdrawAmount: 1,
                limit: 0,
                amount: 1,
            };
        }
        case 'one-limit-and-claim-one-disabled': {
            return {
                title: '1 limit and claim one disabled',
                slug: 'one-limit-and-claim-one-disabled',
                withdrawAmount: 1,
                limit: 1,
                isClaimOnce: false,
                amount: 1,
            };
        }

        case 'expiration-date-is-next-30-min': {
            return {
                title: 'Expiration date is next 30 min',
                slug: 'expiration-date-is-next-30-min',
                withdrawAmount: 1,
                limit: 0,
                isClaimOnce: false,
                expiryDate: addMinutes(new Date(), 30),
                amount: 1,
            };
        }
        case 'expiration-date-is-previous-30-min': {
            return {
                title: 'Expiration date is previous 30 min',
                slug: 'expiration-date-is-previous-30-min',
                withdrawAmount: 1,
                limit: 0,
                isClaimOnce: false,
                expiryDate: minusMinutes(new Date(), 24 * 60),
                amount: 1,
            };
        }

        case 'claim-one-is-enabled': {
            return {
                title: 'Claim one is enabled',
                slug: 'claim-one-is-enabled',
                withdrawAmount: 1,
                limit: 0,
                isClaimOnce: true,
                amount: 1,
            };
        }
        case 'claim-one-is-enabled-and-amount-is-greather-than-1': {
            return {
                title: 'Claim one is enabled and amount is greather than 1',
                slug: 'claim-one-is-enabled-and-amount-is-greather-than-1',
                withdrawAmount: 1,
                limit: 0,
                isClaimOnce: true,
                amount: 10,
            };
        }
        case 'claim-one-is-disabled': {
            return {
                title: 'Claim one is disabled',
                slug: 'claim-one-is-disabled',
                withdrawAmount: 1,
                limit: 0,
                isClaimOnce: false,
                amount: 1,
            };
        }
    }
}

export function getERC721RewardConfiguration(slug: RewardSlug, erc721metadataId: string) {
    switch (slug) {
        case 'no-limit-and-claim-one-disabled': {
            return {
                title: 'RewardNft No limit and claim one disabled',
                slug: 'no-limit-and-claim-one-disabled',
                erc721metadataId,
                limit: 0,
                amount: 1,
                isClaimOnce: false,
            };
        }
        case 'one-limit-and-claim-one-disabled': {
            return {
                title: '1 limit and claim one disabled',
                slug: 'one-limit-and-claim-one-disabled',
                erc721metadataId,
                isClaimOnce: false,
                amount: 1,
            };
        }

        case 'expiration-date-is-next-30-min': {
            return {
                title: 'Expiration date is next 30 min',
                slug: 'expiration-date-is-next-30-min',
                erc721metadataId,
                isClaimOnce: false,
                expiryDate: addMinutes(new Date(), 30),
                amount: 1,
            };
        }
        case 'expiration-date-is-previous-30-min': {
            return {
                title: 'Expiration date is previous 30 min',
                slug: 'expiration-date-is-previous-30-min',
                erc721metadataId,
                isClaimOnce: false,
                expiryDate: minusMinutes(new Date(), 24 * 60),
                amount: 1,
            };
        }

        case 'claim-one-is-enabled': {
            return {
                title: 'Claim one is enabled',
                slug: 'claim-one-is-enabled',
                erc721metadataId,
                isClaimOnce: true,
                amount: 1,
                limit: 0,
            };
        }
        case 'claim-one-is-enabled-and-amount-is-greather-than-1': {
            return {
                title: 'Claim one is enabled and amount is greather than 1',
                slug: 'claim-one-is-enabled-and-amount-is-greather-than-1',
                erc721metadataId,
                isClaimOnce: true,
                isMembershipRequired: false,
                amount: 10,
            };
        }
        case 'claim-one-is-disabled': {
            return {
                title: 'Claim one is disabled',
                slug: 'claim-one-is-disabled',
                erc721metadataId,
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }
    }
}

type RewardSlug =
    | 'no-limit-and-claim-one-disabled'
    | 'one-limit-and-claim-one-disabled'
    | 'expiration-date-is-next-30-min'
    | 'expiration-date-is-previous-30-min'
    | 'claim-one-is-enabled'
    | 'claim-one-is-enabled-and-amount-is-greather-than-1'
    | 'claim-one-is-disabled';

export const createERC721Reward = async (assetPool: AssetPoolDocument, config: TERC721Reward) => {
    const metadata = await ERC721Service.findMetadataById(config.erc721metadataId);
    if (!metadata) {
        throw new NotFoundError('could not find the Metadata for this metadataId');
    }
    const reward = await RewardNftService.create(assetPool, config);
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

export const createERC20Reward = async (assetPool: AssetPoolDocument, payload: TERC20Reward) => {
    const reward = await ERC20RewardService.create(assetPool, payload);
    const claims = await Promise.all(
        Array.from({ length: Number(payload.claimAmount) }).map(() =>
            ClaimService.create({
                poolId: assetPool._id,
                erc20Id: assetPool.erc20Id,
                rewardId: String(reward._id),
            }),
        ),
    );

    return { reward, claims };
};

export const createReferralReward = async (assetPool: AssetPoolDocument, config: TReferralReward) => {
    const reward = await ReferralRewardService.create(assetPool, config);
    const claims = await Promise.all(
        Array.from({ length: Number(reward.claimAmount) }).map(() =>
            ClaimService.create({
                poolId: assetPool._id,
                erc20Id: assetPool.erc20Id,
                rewardId: String(reward._id),
            }),
        ),
    );
    return { reward, claims };
};

export const getQrcode = async (
    fileName: string,
    res: Response,
    reward: ERC20RewardDocument | ReferralRewardDocument | ERC721RewardDocument,
    assetPool: AssetPoolDocument,
) => {
    try {
        const response = await s3PrivateClient.send(
            new GetObjectCommand({
                Bucket: AWS_S3_PRIVATE_BUCKET_NAME,
                Key: fileName,
            }),
        );

        (response.Body as Readable).pipe(res).attachment(fileName);
    } catch (err) {
        if (err.$metadata && err.$metadata.httpStatusCode == 404) {
            const rewardId = String(reward._id);
            const poolId = String(assetPool._id);
            const sub = assetPool.sub;
            const equalJobs = await agenda.jobs({
                name: EVENT_SEND_DOWNLOAD_QR_EMAIL,
                data: { poolId, rewardId, sub, fileName },
            });

            if (!equalJobs.length) {
                agenda.now(EVENT_SEND_DOWNLOAD_QR_EMAIL, {
                    poolId,
                    rewardId,
                    sub,
                    fileName,
                });
            }
            res.status(201).end();
        } else {
            logger.error(err);
            throw err;
        }
    }
};
