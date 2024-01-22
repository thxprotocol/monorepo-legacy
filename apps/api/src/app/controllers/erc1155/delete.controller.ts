import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const erc1155 = await ERC1155.findById(req.params.id);
    if (erc1155.sub !== req.auth.sub) throw new ForbiddenError('Not your ERC1155');

    await erc1155.deleteOne();

    return res.status(204).end();
};
export default { controller, validation };
