import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC20 } from '@thxnetwork/api/models';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    await ERC20.deleteOne({ _id: req.params.id });
    return res.status(204).end();
};

export default { controller, validation };
