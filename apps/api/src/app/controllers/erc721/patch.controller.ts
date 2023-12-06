import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const validation = [param('id').exists(), body('archived').exists().isBoolean()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    let erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find the token for this id');

    erc721 = await erc721.updateOne(req.body, { new: true });

    return res.json(erc721);
};
export default { controller, validation };
