import { Request, Response } from 'express';
import { ERC721Transfer } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const controller = async (req: Request, res: Response) => {
    const erc721Transfer = await ERC721Transfer.findById(req.params.id);
    if (!erc721Transfer) {
        throw new NotFoundError('Could not found the Transaction');
    }

    res.status(200).json(erc721Transfer);
};
export default { controller };
