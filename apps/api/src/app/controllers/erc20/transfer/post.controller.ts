import { Request, Response } from 'express';
import { body } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { toWei } from 'web3-utils';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [
    body('poolId').exists().isMongoId(),
    body('erc20token').exists().isString(),
    body('receiver').exists().isString(),
    body('amount').exists().isString(),
];

export const controller = async (req: Request, res: Response) => {
    console.log('SONO QUIIIIIII -------------------------------------------');
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const account = await AccountProxy.getById(req.auth.sub);
    const assetpool = await AssetPoolService.getById(req.body.poolId);

    if (!assetpool) {
        throw new NotFoundError('Could not find the Asset Pool');
    }
    console.log('ACCOUNT', account);
    console.log('assetpool', assetpool);

    const erc20 = await ERC20Service.findOrImport(assetpool, req.body.erc20token);
    await ERC20Service.transferFrom(
        erc20,
        account.address,
        req.body.receiver,
        toWei(req.body.amount).toString(),
        assetpool,
    );
    res.status(201).json(erc20);
};
export default { controller, validation };
