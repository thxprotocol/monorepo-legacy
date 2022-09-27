import { Request, Response } from 'express';
import DepositService from '@thxnetwork/api/services/DepositService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';

const validation = [param('id').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Deposits']
    const deposit = await DepositService.get(req.assetPool, Number(req.params.id));
    if (!deposit) throw new NotFoundError();
    res.json(deposit);
};

export default { controller, validation };
