import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155 Metadata']
    const metadata = await ERC1155Service.findMetadataById(req.params.metadataId);
    const attributes = await ERC1155Service.parseAttributes(metadata);

    res.header('Content-Type', 'application/json').send(JSON.stringify(attributes, null, 4));
};

export default { controller, validation };
