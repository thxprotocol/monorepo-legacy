import { Request, Response } from 'express';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ShopifyDataProxy from '@thxnetwork/api/proxies/ShopifyDataProxy';

export const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsShopify']
    const account = await AccountProxy.getById(req.auth.sub);
    const priceRules = await ShopifyDataProxy.getPriceRules(account);
    res.json(priceRules);
};

export default { controller, validation };
