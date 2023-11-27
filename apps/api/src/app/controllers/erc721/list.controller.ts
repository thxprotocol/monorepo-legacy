import { Request, Response } from 'express';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { query } from 'express-validator';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [query('archived').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    /* #swagger.tags = ['ERC721']
       #swagger.responses[200] = { schema: { $ref: '#/definitions/ERC721' } } 
    */

    const archived = req.query.archived ? JSON.parse(String(req.query.archived)) : false;
    const result = await ERC721Service.findBySub(req.auth.sub, archived);

    res.json(result.map((erc721: ERC721Document) => erc721._id));
};

export default { controller, validation };
