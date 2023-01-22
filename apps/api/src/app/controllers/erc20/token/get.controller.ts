import { Request, Response } from 'express';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';

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
    const pendingWithdrawals = await WithdrawalService.getPendingWithdrawals(erc20, account);

    const walletBalanceInWei = await erc20.contract.methods.balanceOf(await account.getAddress(erc20.chainId)).call();
    const walletBalance = Number(fromWei(walletBalanceInWei, 'ether'));

    const balanceInWei = await erc20.contract.methods.balanceOf(account.address).call();
    const balance = Number(fromWei(balanceInWei, 'ether'));
    const balancePending = pendingWithdrawals
        .map((item: any) => item.amount)
        .reduce((prev: any, curr: any) => prev + curr, 0);

    erc20.logoImgUrl = erc20.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${erc20.address}.svg`;

    res.json({
        ...token.toJSON(),
        balanceInWei,
        balance,
        balancePending,
        walletBalanceInWei,
        walletBalance,
        pendingWithdrawals,
        erc20,
    });
};

export default { controller, validation };
