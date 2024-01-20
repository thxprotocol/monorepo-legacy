import { Request, Response } from 'express';
import { ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

export const validation = [];

const controller = async (req: Request, res: Response) => {
    const result = await ERC1155Service.findBySub(req.auth.sub);

    res.json(result.map((erc1155: ERC1155Document) => erc1155._id));
};

export default { controller, validation };
