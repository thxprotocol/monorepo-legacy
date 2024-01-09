import { Request, Response } from 'express';
import { param, body } from 'express-validator';
import { Gate } from '@thxnetwork/api/models/Gate';
import PoolService from '@thxnetwork/api/services/PoolService';
import { toChecksumAddress } from 'web3-utils';

export const validation = [
    param('id').isMongoId(),
    body('variant').isInt(),
    body('contractAddress').optional().isEthereumAddress(),
    body('amount').optional().isInt({ min: 0 }),
    body('score').optional().isInt({ min: 0, max: 100 }),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const { title, description, variant, amount, score, contractAddress } = req.body;
    const gate = await Gate.create({
        poolId: pool._id,
        variant: variant,
        title,
        description,
        contractAddress: contractAddress && toChecksumAddress(contractAddress),
        amount: amount && Number(amount),
        score: score && Number(score),
    });

    res.json(gate);
};

export default { controller, validation };
