import { Request, Response } from 'express';
import MemberService from '@thxnetwork/api/services/MemberService';
import { query } from 'express-validator';

export const validation = [query('limit').isNumeric(), query('page').isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Members']
    const response = await MemberService.findByQuery(
        { poolId: req.assetPool._id },
        Number(req.query.page),
        Number(req.query.limit),
    );

    res.send(response);
};

export default { controller };
