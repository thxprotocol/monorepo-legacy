import { param } from 'express-validator';
import { Request, Response } from 'express';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';

const validation = [param('id').isMongoId(), param('metadataId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Metadata']
    const metadata = await ERC721Metadata.findById(req.params.metadataId);
    res.json(metadata);
};

export { controller, validation };
