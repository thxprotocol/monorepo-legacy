import { Request, Response } from 'express';
import { BadRequestError, InsufficientBalanceError } from '@thxnetwork/api/util/errors';
import { toWei } from 'web3-utils';
import { MaxUint256, getProvider } from '@thxnetwork/api/util/network';
import { ERC20Type } from '@thxnetwork/types/enums';
import { body, param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [param('id').isMongoId(), body('erc20Id').exists().isMongoId(), body('amount').exists()];

// TODO
// 1. Create Split
// 2. TransferFrom USDC to Splitter
// 3. Receivers [campaignSafe, companySafe], [70, 30]
// 4. Campaign Safe Deposit 100% in LP
// 5. Transfer 75% to RewardDistributor
// 6. Hold 25% for Quest Incentive Distribution (weekly recurring job with multisend)

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const { defaultAccount } = getProvider(pool.chainId);
    const amount = toWei(String(req.body.amount));
    const erc20 = await ERC20Service.getById(req.body.erc20Id);
    if (erc20.type !== ERC20Type.Limited) throw new BadRequestError('Token type is not Limited type');

    // Check balance to ensure throughput
    const balance = await erc20.contract.methods.balanceOf(defaultAccount).call();
    if (Number(balance) < Number(amount)) throw new InsufficientBalanceError();

    // Check allowance for admin to ensure throughput
    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    const allowance = await erc20.contract.methods.allowance(defaultAccount, safe.address).call();
    if (Number(allowance) < Number(amount)) {
        await TransactionService.send(
            erc20.contract.options.address,
            erc20.contract.methods.approve(defaultAccount, MaxUint256),
            pool.chainId,
        );
    }

    await TransactionService.send(
        erc20.contract.options.address,
        erc20.contract.methods.transfer(safe.address, amount),
        erc20.chainId,
    );

    res.status(200).end();
};

export default { validation, controller };
