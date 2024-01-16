import { Request, Response } from 'express';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Token']
    */
    const token = await ERC20Service.getTokenById(req.params.id);
    if (!token) throw new NotFoundError('ERC20Token not found');

    const erc20 = await ERC20Service.getById(token.erc20Id);
    if (!erc20) throw new NotFoundError('ERC20 not found');

    const wallet = await SafeService.findPrimary(req.auth.sub, erc20.chainId);

    const walletBalanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
    const walletBalance = Number(fromWei(walletBalanceInWei, 'ether'));

    res.json({
        ...token.toJSON(),
        walletBalanceInWei,
        walletBalance,
        erc20,
    });
};

export default { controller, validation };
