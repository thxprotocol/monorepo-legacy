import { AWS_S3_PUBLIC_BUCKET_NAME, IPFS_BASE_URL, NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
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
import IPFSService from '@thxnetwork/api/services/IPFSService';

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

function parseFilename(filename: string, extension: string) {
    return filename.toLowerCase().split(' ').join('-').split('.') + '-' + short.generate() + `.${extension}`;
}

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const zip = createArchiver().jsZip;
    const contents = await zip.loadAsync(req.file.buffer);

    for (const fileName of Object.keys(contents.files)) {
        try {
            const extension = fileName.substring(fileName.lastIndexOf('.')).substring(1);
            if (!extension) continue;

            const originalFileName = fileName.substring(0, fileName.lastIndexOf('.'));
            if (!isValidExtension(extension)) continue;

            const file = await zip.file(fileName).async('nodebuffer');
            if (!(await isValidFileType(file))) continue;

            const filename = parseFilename(originalFileName, extension);
            await s3Client.send(
                new PutObjectCommand({
                    Key: filename,
                    Bucket: AWS_S3_PUBLIC_BUCKET_NAME,
                    ACL: 'public-read',
                    Body: file,
                }),
            );

            const imageUrl = req.file && (await ImageService.upload(req.file));
            let image = imageUrl;
            if (NODE_ENV === 'production') {
                const cid = await IPFSService.addUrlSource(imageUrl);
                image = IPFS_BASE_URL + cid;
            }

            await ERC721Metadata.create({
                erc721Id: String(erc721._id),
                name: req.body.name,
                description: req.body.description,
                externalUrl: req.body.externalUrl,
                image,
                imageUrl,
            });
        } catch (err) {
            console.log(err);
            logger.error(err);
        }
    }

    res.status(201).end();
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
