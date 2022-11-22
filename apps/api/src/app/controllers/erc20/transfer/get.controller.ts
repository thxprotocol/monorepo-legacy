import { Request, Response } from 'express';
import ERC20Transfer from '@thxnetwork/api/models/ERC20Transfer';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const erc20Transfer = await ERC20Transfer.findById(req.params.id);
    if (!erc20Transfer) {
        throw new NotFoundError('Could not found the Transaction');
    }

    res.status(200).json(erc20Transfer);
};
export default { controller };
