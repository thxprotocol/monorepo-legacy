import { Request, Response } from 'express';
import BrandService from '@thxnetwork/api/services/BrandService';

export default {
    controller: async (req: Request, res: Response) => {
        const brand = await BrandService.get(req.assetPool._id);
        res.json(brand);
    },
};
