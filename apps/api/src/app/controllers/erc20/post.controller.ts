import { Request, Response } from 'express';
import { body, query } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { checkAndUpgradeToBasicPlan } from '@thxnetwork/api/util/plans';

export const validation = [
    body('symbol').exists().isString(),
    body('chainId').exists().isNumeric(),
    body('type').exists().isNumeric(),
    body('totalSupply').optional().isNumeric(),
    query('forceSync').optional().isBoolean(),
    body('logoImgUrl').optional().isString(),
];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Contract']
    #swagger.responses[200] = { 
            description: 'Deploy an ERC20 contract for this user.',
            schema: { $ref: '#/definitions/ERC20' } 
    }
    */
    const account = await AccountProxy.getById(req.auth.sub);

    await checkAndUpgradeToBasicPlan(account, req.body.chainId);

    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : false;

    const erc20 = await ERC20Service.deploy(
        {
            name: req.body.name,
            symbol: req.body.symbol,
            chainId: req.body.chainId,
            totalSupply: req.body.totalSupply,
            type: req.body.type,
            sub: req.auth.sub,
            logoImgUrl: req.body.logoImgUrl,
        },
        forceSync,
    );

    res.status(201).json(erc20);
};
export default { controller, validation };
