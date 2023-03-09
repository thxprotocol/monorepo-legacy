import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

const validation = [param('id').isMongoId(), body('attributes').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']

    const erc1155 = await ERC1155Service.findById(req.params.id);
    if (!erc1155) throw new NotFoundError('Could not find this NFT in the database');

    const metadata = await ERC1155Service.createMetadata(erc1155, req.body.attributes);
    const tokens = metadata.tokens || [];

    res.status(201).json({ ...metadata.toJSON(), tokens });
};
export default { controller, validation };
