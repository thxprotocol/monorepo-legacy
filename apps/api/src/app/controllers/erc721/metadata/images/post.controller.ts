import { AWS_S3_PUBLIC_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ImageService from '@thxnetwork/api/services/ImageService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { logger } from '@thxnetwork/api/util/logger';
import { s3, s3Client } from '@thxnetwork/api/util/s3';

import { createArchiver } from '@thxnetwork/api/util/zip';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { fromBuffer } from 'file-type';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';
import short from 'short-uuid';
import { createReward } from '@thxnetwork/api/controllers/rewards/utils';
import { completeMultiUpload, createMultipartUpload, generatePresignedUrlsParts, uploadParts } from './multipartUpload';
const validation = [
    param('id').isMongoId(),
    body('propName').exists().isString(),
    check('file').custom((value, { req }) => {
        switch (req.file.mimetype) {
            case 'application/octet-stream':
            case 'application/zip':
            case 'application/rar':
                return true;
            default:
                return false;
        }
    }),
];
const CHUNK_SIZE = 1000;
const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    // UNZIP THE FILE
    const zip = createArchiver().jsZip;

    // LOAD ZIP IN MEMORY
    const contents = await zip.loadAsync(req.file.buffer);

    // ITERATE THE CONTENT BY OBJECT KEYS
    const objectKeys = Object.keys(contents.files);

    const promises = [];

    for (const file of objectKeys) {
        const extension = file.substring(file.lastIndexOf('.')).substring(1);
        const originalFileName = file.substring(0, file.lastIndexOf('.'));

        if (!extension) {
            continue;
        }
        // FILE VALIDATION
        if (!isValidExtension(extension)) {
            logger.info(`INVALID EXTENSION, FILE SKIPPED: ${file}`);
            continue;
        }

        // CREATE THE FILE BUFFER
        const buffer = await zip.file(file).async('nodebuffer');

        if (!(await isValidFileType(buffer))) {
            logger.info(`INVALID FILE TYPE, FILE SKIPPED: ${file}`);
            continue;
        }

        promises.push(
            (async () => {
                try {
                    // FORMAT FILENAME
                    const filename =
                        originalFileName.toLowerCase().split(' ').join('-').split('.') +
                        '-' +
                        short.generate() +
                        `.${extension}`;
                    // --------------------------------------------------------------------
                    // PREPARE PARAMS FOR UPLOAD TO S3 BUCKET
                    // const uploadParams = {
                    //     Key: filename,
                    //     Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
                    //     ACL: 'public-read',
                    //     Body: buffer,
                    // };

                    // UPLOAD THE FILE TO S3
                    //await s3Client.send(new PutObjectCommand(uploadParams));
                    // --------------------------------------------------------------------
                    const params = { Bucket: AWS_S3_PUBLIC_BUCKET_NAME, Key: filename };
                    const uploadId = await createMultipartUpload(params);

                    const urls = await generatePresignedUrlsParts(uploadId, 4, params);

                    const parts = await uploadParts(buffer, urls);
                    const result = await completeMultiUpload(uploadId, parts, params);
                    console.log('------------------------RESULT', result);

                    // COLLECT THE URL
                    const url = ImageService.getPublicUrl(filename);

                    // CREATE THE METADATA
                    const metadata = await ERC721Service.createMetadata(erc721, '', '', [
                        { key: req.body.propName, value: url },
                    ]);

                    createReward(req.assetPool, {
                        erc721metadataId: String(metadata._id),
                        withdrawAmount: 0,
                        withdrawDuration: 0,
                        withdrawLimit: 1,
                        isClaimOnce: true,
                        isMembershipRequired: false,
                    });

                    return metadata;
                } catch (err) {
                    logger.error(err);
                }
            })(),
        );
    }

    const metadatas: ERC721MetadataDocument[] = await Promise.all(promises);
    checkMemory('execute promises');
    res.status(201).json({ metadatas });
};

function isValidExtension(extension: string) {
    return ['jpg', 'jpeg', 'gif', 'png'].includes(extension);
}

async function isValidFileType(buffer: Buffer) {
    const { mime } = await fromBuffer(buffer);

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(mime)) {
        return false;
    }

    return true;
}

function checkMemory(functionName: string) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(
        `----------------------------The script '${functionName}' uses approximately ${
            Math.round(used * 100) / 100
        } MB`,
    );
}
export default { controller, validation };
