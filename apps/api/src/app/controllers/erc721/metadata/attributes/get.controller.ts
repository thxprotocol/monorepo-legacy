import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Metadata']
    const metadata = await ERC721Service.findMetadataById(req.params.metadataId);
    const attributes = await ERC721Service.parseAttributes(metadata);

    res.header('Content-Type', 'application/json').send(JSON.stringify(attributes, null, 4));
};

export default { controller, validation };
