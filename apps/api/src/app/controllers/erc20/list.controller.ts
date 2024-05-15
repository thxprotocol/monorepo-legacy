import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { Request, Response } from 'express';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const erc20s = await ERC20Service.findBySub(req.auth.sub);
    return res.json(erc20s);
};

export { controller, validation };
