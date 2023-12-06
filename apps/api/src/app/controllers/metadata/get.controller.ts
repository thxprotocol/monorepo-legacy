import { param } from 'express-validator';
import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Metadata']
    const metadata = await ERC721Metadata.findById(req.params.metadataId);
    if (!metadata) throw new NotFoundError('Could not find metadata for this ID');

    const attributes = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        external_url: metadata.externalUrl,
    };

    res.header('Content-Type', 'application/json').send(JSON.stringify(attributes, null, 4));
};

export default { controller, validation };
