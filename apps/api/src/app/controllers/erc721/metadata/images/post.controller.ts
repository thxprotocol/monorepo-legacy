import { AWS_S3_PUBLIC_BUCKET_NAME } from '@thxnetwork/api/config/secrets';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ImageService from '@thxnetwork/api/services/ImageService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { logger } from '@thxnetwork/api/util/logger';
import { s3Client } from '@thxnetwork/api/util/s3';
import { createArchiver } from '@thxnetwork/api/util/zip';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { fromBuffer } from 'file-type';

import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';
import short from 'short-uuid';

const validation = [
    param('id').isMongoId(),
    body('title').optional().isString().isLength({ min: 0, max: 100 }),
    body('description').optional().isString().isLength({ min: 0, max: 400 }),
    body('propName').exists().isString(),
    check('compressedFile').custom((value, { req }) => {
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

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    // UNZIP THE FILE
    const zip = createArchiver().jsZip;
    const metadatas: ERC721MetadataDocument[] = [];

    // LOAD ZIP IN MEMORY
    const contents = await zip.loadAsync(req.file.buffer);

    // ITERATE THE CONTENT BY OBJECT KEYS
    const objectKeys = Object.keys(contents.files);
    const promises = [];

    for (let i = 0; i < objectKeys.length; i++) {
        const file = objectKeys[i];
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

        const promise = new Promise(async (resolve, reject) => {
            try {
                // FORMAT FILENAME
                const filename =
                    originalFileName.toLowerCase().split(' ').join('-').split('.') +
                    '-' +
                    short.generate() +
                    `.${extension}`;

                // PREPARE PARAMS FOR UPLOAD TO S3 BUCKET
                const uploadParams = {
                    Key: filename,
                    Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
                    ACL: 'public-read',
                    Body: buffer,
                };

                // UPLOAD THE FILE TO S3
                await s3Client.send(new PutObjectCommand(uploadParams));

                // COLLECT THE URL
                const url = ImageService.getPublicUrl(filename);

                // CREATE THE METADATA
                const metadata = await ERC721Service.createMetadata(erc721, req.body.title, req.body.description, [
                    { key: req.body.propName, value: url },
                ]);

                metadatas.push(metadata);
                resolve(metadata);
            } catch (err) {
                logger.error(err);
                reject(err);
            }
        });

        promises.push(promise);
    }
    await Promise.all(promises);
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
export default { controller, validation };
