import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { param } from 'express-validator';

const validation = [param('id').exists().isMongoId(), param('address').exists().isString()];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Balance']
    */
    const erc20 = await ERC20Service.getById(req.params.id);
    if (!erc20) throw new NotFoundError('Could not find the ERC20');

    const balance = await erc20.contract.methods.balanceOf(req.params.address).call();

    res.status(200).json(balance);
};
export default { controller, validation };
