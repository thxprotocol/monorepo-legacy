import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155 Metadata']
    await ERC1155Service.deleteMetadata(req.params.metadataId);
    res.status(200).json({ success: true });
};

export default { controller, validation };
