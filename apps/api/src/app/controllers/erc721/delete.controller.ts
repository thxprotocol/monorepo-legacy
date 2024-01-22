import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { ERC721 } from '@thxnetwork/api/models/ERC721';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721.findById(req.params.id);
    if (erc721.sub !== req.auth.sub) throw new ForbiddenError('Not your ERC721');

    await erc721.deleteOne();

    return res.status(204).end();
};
export default { controller, validation };
