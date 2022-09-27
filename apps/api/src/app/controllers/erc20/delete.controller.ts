import { Request, Response } from 'express';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { param } from 'express-validator';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC20 Contract']
    await ERC20Service.removeById(req.params.id);

    return res.status(204).end();
};

export default { controller, validation };
