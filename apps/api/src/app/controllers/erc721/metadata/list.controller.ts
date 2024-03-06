import { Request, Response } from 'express';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { param, query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const validation = [
    param('id').isMongoId(),
    query('limit').optional().isInt({ gt: 0 }),
    query('page').optional().isInt({ gt: 0 }),
];

export const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const result = await ERC721Service.findMetadataByNFT(
        erc721._id,
        req.query.page ? Number(req.query.page) : null,
        req.query.limit ? Number(req.query.limit) : null,
    );
    res.json(result);
};

export default { controller, validation };
