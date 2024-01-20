import { Request, Response } from 'express';
import { param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const erc20 = await ERC20Service.getById(req.params.id);
    if (!erc20) throw new NotFoundError('Could not find the token for this id');

    const result = await ERC20Service.update(erc20, req.body);
    return res.json(result);
};
export default { controller, validation };
