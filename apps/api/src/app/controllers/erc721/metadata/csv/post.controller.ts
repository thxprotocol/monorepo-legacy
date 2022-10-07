import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { check, param } from 'express-validator';
import { Readable } from 'stream';
import { logger } from '@thxnetwork/api/util/logger';
import CsvReadableStream from 'csv-reader';
import { createReward } from '@thxnetwork/api/controllers/rewards/utils';
import { agenda, EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL } from '@thxnetwork/api/util/agenda';

const validation = [
    param('id').isMongoId(),
    check('csvFile').custom((_value, { req }) => req.file.mimetype === 'text/csv'),
];

const controller = async (req: Request, res: Response) => {
    try {
        // #swagger.tags = ['ERC721']
        const erc721 = await ERC721Service.findById(req.params.id);
        if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

        // GET THE ERC721 PROPERTIES FOR HEADER VALIDATION
        const properties = erc721.properties.map((x) => x.name);
        properties.push('MetadataID');

        const readeableStream = Readable.from(req.file.buffer.toString());

        const promises: Promise<any>[] = [];

        readeableStream
            .pipe(new CsvReadableStream({ skipHeader: true, asObject: true }))
            .on('header', (header) => {
                // HEADER VALIDATION
                if (header.length != properties.length) {
                    throw new BadRequestError('Invalid CSV schema: length');
                }
                for (let i = 0; i < header.length; i++) {
                    if (properties[i] != header[i]) {
                        throw new BadRequestError(`Invalid CSV schema: property: ${header[i]}`);
                    }
                }
            })
            .on('data', async (row: any) => {
                const promise = (async () => {
                    try {
                        // MAP THE RECORDS TO ATTRIBUTES
                        const attributes: { key: string; value: any }[] = Object.entries(row)
                            .filter((x) => x[0].toLocaleLowerCase() != 'metadataid')
                            .map((e) => {
                                return {
                                    key: e[0],
                                    value: e[1],
                                };
                            });

                        // CHECK IF THE METADATA IS PRESENT IN THE DB
                        let metadata;
                        if (row.MetadataID && row.MetadataID.length > 0) {
                            metadata = await ERC721Service.findMetadataById(row.MetadataID);
                        }

                        // IF PRESENT, UPDATE THE DOCUMENT
                        if (metadata) {
                            metadata.attributes = attributes;
                            metadata.save();
                        } else {
                            // CREATE NEW METADATA
                            metadata = await ERC721Service.createMetadata(erc721, '', '', attributes);

                            // GENERATE A NEW REWARD and CLAIMS FOR THE NEW METADATA
                            const body = {
                                ...req.body,
                                erc721metadataId: metadata._id,
                                withdrawAmount: 0,
                                withdrawDuration: 0,
                                withdrawLimit: 1,
                                isClaimOnce: true,
                                isMembershipRequired: false,
                            };
                            createReward(req.assetPool, body);
                        }
                    } catch (err) {
                        logger.error(err);
                    }
                })();
                promises.push(promise);
            })
            .on('error', (err) => {
                let status = 500;
                if (err.message.includes('Invalid CSV schema')) {
                    status = 400;
                }
                res.status(status).json({ message: err.message }).end();
            })
            .on('end', async () => {
                await Promise.all(promises);

                const poolId = String(req.assetPool._id);
                const sub = req.assetPool.sub;
                const notify = false; // IT WILL RE-CREATE THE FILE WITHOUT SENDING THE EMAIL
                const fileName = `${req.assetPool._id}_metadata.zip`;

                await agenda.now(EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL, {
                    poolId,
                    sub,
                    fileName,
                    notify,
                });

                res.status(201).json({}).end();
            });
    } catch (err) {
        logger.error(err);
        throw err;
    }
};

export default { controller, validation };
