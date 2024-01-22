import { param } from 'express-validator';
import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155Metadata } from '@thxnetwork/api/models/ERC1155Metadata';

export const validation = [param('erc1155Id').isMongoId(), param('tokenId').isInt()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155 Metadata']
    const { erc1155Id, tokenId } = req.params;
    const metadata = await ERC1155Metadata.findOne({ erc1155Id, tokenId });
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
