import { param } from 'express-validator';
import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Metadata']
    const metadata = await ERC721Service.findMetadataById(req.params.metadataId);
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
