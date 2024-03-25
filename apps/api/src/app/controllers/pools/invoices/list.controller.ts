import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Invoice } from '@thxnetwork/api/models';

export const validation = [];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new Error('Pool not found');

    const invoices = await Invoice.find({ poolId: pool._id });
    res.json(invoices);
};

export default { controller, validation };
