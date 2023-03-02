import ShopifyDataProxy from '@thxnetwork/api/proxies/ShopifyDataProxy';
import { Request, Response } from 'express';

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account']
    const result = await ShopifyDataProxy.getShopify(req.auth.sub);
    res.json(result);
};
export default { controller };
