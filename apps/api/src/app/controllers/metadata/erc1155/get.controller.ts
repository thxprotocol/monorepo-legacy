import { param } from 'express-validator';
import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155 Metadata']
    const { erc1155Id, tokenId } = req.params;
    const token = await ERC1155Token.findOne({ erc1155Id, tokenId: Number(tokenId) });
    if (!token) throw new NotFoundError('Could not find token for this ID');
    const metadata = await ERC1155Service.findMetadataById(token.metadataId);
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
