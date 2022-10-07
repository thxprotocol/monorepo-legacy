import { Request, Response } from 'express';
import { SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import { agenda, EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL } from '@thxnetwork/api/util/agenda';
import { AWS_S3_PRIVATE_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { s3PrivateClient } from '@thxnetwork/api/util/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { logger } from '@thxnetwork/api/util/logger';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Metadata']
    if (req.auth.sub !== req.assetPool.sub) throw new SubjectUnauthorizedError();
    const fileName = `${req.assetPool._id}_metadata.zip`;
    const scheduleJob = () =>
        agenda.now(EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL, {
            fileName,
            poolId: String(req.assetPool._id),
            sub: req.assetPool.sub,
            notify: true,
        });
    // Run to refresh the file
    scheduleJob();

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
            res.status(201).end();
        } else {
            logger.error(err);
            throw err;
        }
    }
};

export default { controller };
