import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';

export const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Imported Tokens']

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const tokenList = await ERC721Token.find({ recipient: pool.address });

    res.json(tokenList.map((x) => x.toJSON()));
};

export default { controller, validation };
