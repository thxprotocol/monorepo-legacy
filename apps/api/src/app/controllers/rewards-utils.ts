import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import RewardNftService from '@thxnetwork/api/services/RewardNftService';
import RewardReferralService from '@thxnetwork/api/services/RewardReferralService';
import RewardService from '@thxnetwork/api/services/RewardService';
import RewardTokenService from '@thxnetwork/api/services/RewardTokenService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { agenda, EVENT_SEND_DOWNLOAD_QR_EMAIL } from '@thxnetwork/api/util/agenda';
import { AWS_S3_PRIVATE_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { s3PrivateClient } from '@thxnetwork/api/util/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { logger } from '@thxnetwork/api/util/logger';
import { Response } from 'express';
import { RewardNftDocument } from '../models/RewardNft';
import { RewardReferralDocument } from '../models/RewardReferral';
import { RewardTokenDocument } from '../models/RewardToken';
import { TRewardNft } from '../types/RewardNft';

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

export function getRewardConfiguration(slug: RewardSlug) {
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
                withdrawDuration: 0,
                withdrawLimit: 1,
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }

        case 'expiration-date-is-next-30-min': {
            return {
                title: 'Expiration date is next 30 min',
                slug: 'expiration-date-is-next-30-min',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: false,
                isMembershipRequired: false,
                expiryDate: addMinutes(new Date(), 30),
                amount: 1,
            };
        }
        case 'expiration-date-is-previous-30-min': {
            return {
                title: 'Expiration date is previous 30 min',
                slug: 'expiration-date-is-previous-30-min',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: false,
                isMembershipRequired: false,
                expiryDate: minusMinutes(new Date(), 24 * 60),
                amount: 1,
            };
        }

        case 'claim-one-is-enabled': {
            return {
                title: 'Claim one is enabled',
                slug: 'claim-one-is-enabled',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: true,
                isMembershipRequired: false,
                amount: 1,
            };
        }
        case 'claim-one-is-enabled-and-amount-is-greather-than-1': {
            return {
                title: 'Claim one is enabled and amount is greather than 1',
                slug: 'claim-one-is-enabled-and-amount-is-greather-than-1',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: true,
                isMembershipRequired: false,
                amount: 10,
            };
        }
        case 'claim-one-is-disabled': {
            return {
                title: 'Claim one is disabled',
                slug: 'claim-one-is-disabled',
                withdrawAmount: 1,
                withdrawDuration: 0,
                withdrawLimit: 0,
                isClaimOnce: false,
                isMembershipRequired: false,
                amount: 1,
            };
        }
    }
}

export function getRewardNftConfiguration(slug: RewardSlug, erc721metadataId: string) {
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

export const createRewardNft = async (
    assetPool: AssetPoolDocument,
    config: {
        title: string;
        slug: string;
        limit: number;
        expiryDate: Date;
        erc721metadataId: string;
        rewardConditionId?: string;
        amount: number;
        isClaimOnce: boolean;
    },
) => {
    const metadata = await ERC721Service.findMetadataById(config.erc721metadataId);
    if (!metadata) {
        throw new NotFoundError('could not find the Metadata for this metadataId');
    }
    const amount = config.amount | 1;
    const reward = await RewardNftService.create(assetPool, {
        title: config.title,
        slug: config.slug,
        limit: config.limit || 0,
        expiryDate: config.expiryDate,
        erc721metadataId: config.erc721metadataId,
        rewardConditionId: config.rewardConditionId,
        amount,
        isClaimOnce: config.isClaimOnce,
    });

    const claims = await Promise.all(
        Array.from({ length: amount }).map(() =>
            ClaimService.create({
                poolId: assetPool._id,
                erc20Id: null,
                erc721Id: metadata.erc721,
                rewardId: reward.rewardBaseId,
            }),
        ),
    );

    return { reward, claims };
};

export const createRewardToken = async (
    assetPool: AssetPoolDocument,
    config: {
        title: string;
        slug: string;
        limit: number;
        expiryDate: Date;
        rewardConditionId?: string;
        withdrawAmount: number;
        amount: number;
        isClaimOnce: boolean;
    },
) => {
    const amount = config.amount | 1;
    const reward = await RewardTokenService.create(assetPool, {
        title: config.title,
        slug: config.slug,
        limit: config.limit || 0,
        expiryDate: config.expiryDate,
        rewardConditionId: config.rewardConditionId,
        withdrawAmount: config.withdrawAmount,
        amount,
        isClaimOnce: config.isClaimOnce,
    });

    const claims = await Promise.all(
        Array.from({ length: amount }).map(() =>
            ClaimService.create({
                poolId: assetPool._id,
                erc20Id: assetPool.erc20Id,
                rewardId: reward.rewardBaseId,
            }),
        ),
    );

    return { reward, claims };
};

export const createRewardReferral = async (
    assetPool: AssetPoolDocument,
    config: {
        title: string;
        slug: string;
        limit: number;
        expiryDate: Date;
        amount: number;
        isClaimOnce: boolean;
    },
) => {
    const amount = config.amount | 1;
    const reward = await RewardReferralService.create(assetPool, {
        title: config.title,
        slug: config.slug,
        limit: config.limit || 0,
        expiryDate: config.expiryDate,
        amount,
        isClaimOnce: config.isClaimOnce,
    });

    const claims = await Promise.all(
        Array.from({ length: amount }).map(() =>
            ClaimService.create({
                poolId: assetPool._id,
                erc20Id: assetPool.erc20Id,
                rewardId: reward.rewardBaseId,
            }),
        ),
    );

    return { reward, claims };
};

export const getQrcode = async (
    fileName: string,
    res: Response,
    reward: RewardNftDocument | RewardReferralDocument | RewardTokenDocument,
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
            const rewardId = reward.id;
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

export const formatRewardNft = async (reward: RewardNftDocument) => {
    return {
        id: reward.id,
        erc721metadataId: reward.erc721metadataId,
        rewardBaseId: reward.rewardBaseId,
        rewardConditionId: reward.rewardConditionId,
        rewardBase: await reward.rewardBase,
    } as TRewardNft;
};
