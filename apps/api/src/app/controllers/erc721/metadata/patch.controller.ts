import { Request, Response } from 'express';
import { body, param } from 'express-validator';

import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [
    param('id').isMongoId(),
    param('metadataId').isMongoId(),
    body('title').isString().isLength({ min: 0, max: 100 }),
    body('description').isString().isLength({ min: 0, max: 400 }),
    body('attributes').exists(),
];

const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const metadata = await ERC721Service.findMetadataById(req.params.metadataId);
    if (!metadata) throw new NotFoundError('Could not find this NFT Metadata in the database');

    const tokens = metadata.tokens || [];
    if (tokens.length) throw new BadRequestError('There token minted with this metadata');

    await metadata.updateOne({
        title: req.body.title,
        description: req.body.description,
        attributes: req.body.attributes,
    });

    res.status(201).json({ ...metadata.toJSON(), tokens });
};

export default { controller, validation };
