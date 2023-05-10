import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC1155MetadataDocument } from '@thxnetwork/api/models/ERC1155Metadata';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Metadata']
    let metadata: ERC721MetadataDocument | ERC1155MetadataDocument = await ERC721Service.findMetadataById(
        req.params.metadataId,
    );
    if (!metadata) {
        metadata = await ERC1155Service.findMetadataById(req.params.metadataId);
    }
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
