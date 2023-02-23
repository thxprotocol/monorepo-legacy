import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { getValue } from './post.controller';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const validation = [param('id').isMongoId(), param('metadataId').isMongoId(), body('attributes').exists()];

const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const metadata = await ERC721Service.findMetadataById(req.params.metadataId);
    if (!metadata) throw new NotFoundError('Could not find this NFT Metadata in the database');

    const tokens = metadata.tokens || [];
    if (tokens.length) throw new BadRequestError('There token minted with this metadata');

    metadata.imgUrl = getValue(req.body.attributes, 'image') || metadata.imgUrl;
    metadata.name = getValue(req.body.attributes, 'name') || metadata.name;
    metadata.image = getValue(req.body.attributes, 'image') || metadata.image;
    metadata.description = getValue(req.body.attributes, 'description') || metadata.description;
    metadata.externalUrl = getValue(req.body.attributes, 'externalUrl') || metadata.externalUrl;

    await metadata.save();

    res.json({ ...metadata.toJSON(), tokens });
};

export default { controller, validation };
