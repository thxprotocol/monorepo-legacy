import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

const validation = [param('id').isMongoId(), param('metadataId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155 Metadata']
    const metadata = await ERC1155Service.findMetadataById(req.params.metadataId);
    res.json(metadata);
};

export { controller, validation };
