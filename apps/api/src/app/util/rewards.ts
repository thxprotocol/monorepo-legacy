import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { agenda, EVENT_SEND_DOWNLOAD_QR_EMAIL } from '@thxnetwork/api/util/agenda';
import { AWS_S3_PRIVATE_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { s3PrivateClient } from '@thxnetwork/api/util/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { TERC721Reward, TERC20Reward, TReferralReward } from '@thxnetwork/types/';
import { Readable } from 'stream';
import { logger } from '@thxnetwork/api/util/logger';
import { Response } from 'express';
import { ERC20Reward, ERC20RewardDocument } from '../models/ERC20Reward';
import { ERC721Reward, ERC721RewardDocument } from '../models/ERC721Reward';
import { ReferralReward, ReferralRewardDocument } from '../models/ReferralReward';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC20RewardService from '../services/ERC20RewardService';
import ERC721RewardService from '@thxnetwork/api/services/ERC721RewardService';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';

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
