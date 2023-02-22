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
import { createERC721Perk } from '@thxnetwork/api/util/rewards';
import { RewardConditionPlatform, TERC721Perk } from '@thxnetwork/types/index';
import short from 'short-uuid';
import db from '@thxnetwork/api/util/database';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import IPFSService from '@thxnetwork/api/services/IPFSService';
import { AccountPlanType } from '@thxnetwork/api/types/enums';

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

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const account = await AccountProxy.getById(req.auth.sub);

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
                    const uploadParams = {
                        Key: filename,
                        Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
                        ACL: 'public-read',
                        Body: buffer,
                    };

                    // UPLOAD THE FILE TO S3
                    await s3Client.send(new PutObjectCommand(uploadParams));
                    // --------------------------------------------------------------------

                    // COLLECT THE URL
                    let url = ImageService.getPublicUrl(filename);
                    if (account.plan === AccountPlanType.Premium) {
                        const result = await IPFSService.add(url);
                        url = 'https://ipfs.io/ipfs/' + result.cid.toString();
                    }

                    // CREATE THE METADATA
                    const metadata = await ERC721Service.createMetadata(erc721, [
                        {
                            key: req.body.propName,
                            value: url,
                        },
                        {
                            key: 'name',
                            value: req.body.name,
                        },
                        {
                            key: 'description',
                            value: req.body.description,
                        },
                        {
                            key: 'external_url',
                            value: req.body.external_url,
                        },
                    ]);

                    await createERC721Perk(pool, {
                        uuid: db.createUUID(),
                        erc721metadataId: String(metadata._id),
                        poolId: String(pool._id),
                        title: '',
                        description: '',
                        expiryDate: null,
                        claimAmount: 1,
                        rewardLimit: 1,
                        platform: RewardConditionPlatform.None,
                        isPromoted: false,
                    } as TERC721Perk);

                    return metadata;
                } catch (err) {
                    logger.error(err);
                }
            })(),
        );
    }

    const metadatas: ERC721MetadataDocument[] = await Promise.all(promises);

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
