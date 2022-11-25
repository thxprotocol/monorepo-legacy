import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [param('metadataId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Metadata']
    await ERC721Service.deleteMetadata(req.params.metadataId);
    res.status(200).json({ success: true });
};

export default { controller, validation };
