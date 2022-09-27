import { Request, Response } from 'express';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Token']
    #swagger.responses[200] = {
            description: 'Get an ERC20 token for this user.',
            schema: { $ref: '#/definitions/ERC20Token' }
    }
    */
    const token = await ERC20Service.getTokenById(req.params.id);
    if (!token) throw new NotFoundError('ERC20Token not found');

    const erc20 = await ERC20Service.getById(token.erc20Id);
    if (!erc20) throw new NotFoundError('ERC20 not found');

    const account = await AccountProxy.getById(req.auth.sub);
    const balanceInWei = await erc20.contract.methods.balanceOf(account.address).call();
    const balance = Number(fromWei(balanceInWei, 'ether'));

    res.status(200).json({
        ...erc20.toJSON(),
        ...token.toJSON(),
        balance,
    });
};

export default { controller, validation };
