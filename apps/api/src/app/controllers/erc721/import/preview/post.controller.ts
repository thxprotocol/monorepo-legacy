import { getNFTsForOwner } from '@thxnetwork/api/util/alchemy';
import { Request, Response } from 'express';
import { body } from 'express-validator';

export const validation = [body('address').exists().isString(), body('chainId').exists().isInt()];

export const controller = async (req: Request, res: Response) => {
    const ownedNFTs = await getNFTsForOwner(req.body.address, req.body.contractAddress);
    res.status(200).json(ownedNFTs);
};
export default { controller, validation };
