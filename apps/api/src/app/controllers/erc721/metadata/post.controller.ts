import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const validation = [param('id').isMongoId(), body('attributes').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']

    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const metadata = await ERC721Service.createMetadata(erc721, req.body.attributes);
    const tokens = metadata.tokens || [];

    res.status(201).json({ ...metadata.toJSON(), tokens });
};
export default { controller, validation };
