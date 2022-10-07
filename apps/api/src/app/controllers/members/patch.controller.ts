import { Request, Response } from 'express';
import { VERSION } from '@thxnetwork/api/config/secrets';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { body, param } from 'express-validator';

const validation = [param('address').isEthereumAddress(), body('isManager').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Members']
    const isMember = await req.assetPool.contract.methods.isMember(req.params.address).call();
    if (!isMember) throw new NotFoundError();

    await TransactionService.send(
        req.assetPool.address,
        req.assetPool.contract.methods[req.body.isManager ? 'addManager' : 'removeManager'](req.params.address),
        req.assetPool.chainId,
    );

    res.redirect(`/${VERSION}/members/${req.params.address}`);
};

export default { controller, validation };
