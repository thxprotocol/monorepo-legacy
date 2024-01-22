import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find the token for this id');
    if (erc721.sub !== req.auth.sub) throw new ForbiddenError('Not your ERC721');

    const result = await ERC721.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(result);
};
export default { controller, validation };
