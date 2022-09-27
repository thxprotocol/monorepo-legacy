import { Request, Response } from 'express';
import RewardService from '@thxnetwork/api/services/RewardService';
import { param } from 'express-validator';
import { NotFoundError, SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import { agenda, EVENT_SEND_DOWNLOAD_QR_EMAIL } from '@thxnetwork/api/util/agenda';
import { AWS_S3_PRIVATE_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { s3PrivateClient } from '@thxnetwork/api/util/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { logger } from '@thxnetwork/api/util/logger';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    if (req.auth.sub !== req.assetPool.sub) throw new SubjectUnauthorizedError();

    const reward = await RewardService.get(req.assetPool, req.params.id);
    if (!reward) throw new NotFoundError('Reward not found');

    const fileName = `${reward._id}.zip`;
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
            const poolId = String(req.assetPool._id);
            const sub = req.assetPool.sub;
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

export default { controller, validation };
