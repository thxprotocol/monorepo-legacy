import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { query } from 'express-validator';

export const validation = [query('erc721Id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Imported Tokens']

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const tokenList = await ERC721Token.find({
        sub: null,
        recipient: pool.address,
        erc721Id: req.query.erc721Id,
    });
    res.json(tokenList.map((x) => x.toJSON()));
};

export default { controller, validation };
