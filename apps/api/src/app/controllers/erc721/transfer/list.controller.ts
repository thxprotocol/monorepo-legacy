import { Request, Response } from 'express';
import { query } from 'express-validator';
import { ERC721Transfer } from '@thxnetwork/api/models';

export const validation = [query('erc721Id').exists().isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const result = await ERC721Transfer.find({
        erc721Id: req.query.erc721Id,
        sub: req.auth.sub,
    });

    res.status(200).json(result);
};
export default { controller, validation };
