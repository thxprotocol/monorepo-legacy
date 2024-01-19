import { Request, Response } from 'express';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [];

const controller = async (req: Request, res: Response) => {
    const result = await ERC721Service.findBySub(req.auth.sub);
    res.json(result.map((erc721: ERC721Document) => erc721._id));
};

export default { controller, validation };
