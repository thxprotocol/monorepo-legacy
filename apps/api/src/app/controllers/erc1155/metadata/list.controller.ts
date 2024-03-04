import { Request, Response } from 'express';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import { param, query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const validation = [
    param('id').isMongoId(),
    query('limit').optional().isInt({ gt: 0 }),
    query('page').optional().isInt({ gt: 0 }),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']
    const erc1155 = await ERC1155Service.findById(req.params.id);
    if (!erc1155) throw new NotFoundError('Could not find this NFT in the database');

    const result = await ERC1155Service.findMetadataByNFT(
        req.params.id,
        req.query.page ? Number(req.query.page) : null,
        req.query.limit ? Number(req.query.limit) : null,
    );
    res.json(result);
};

export default { controller, validation };
