import { Request, Response } from 'express';
import { Widget } from '@thxnetwork/api/models';

const controller = async (req: Request, res: Response) => {
    const widgets = await Widget.find({ poolId: req.header('X-PoolId') });
    res.json(widgets);
};

export default { controller };
