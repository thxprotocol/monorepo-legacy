import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { body, param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

import {} from '@thxnetwork/api/services/LiquidityService';

export const validation = [param('id').isMongoId(), body('erc20Id').exists().isMongoId(), body('amount').exists()];

// TODO
// 1. Customer transers 100% USDC to Campaign Safe
// 2. Campaign Safe calls multiSend for 2 transactions
// 2.1 transfer 30% of USDC to Company Safe
// 2.2 joinPool 70% of USDC to LP
// 2.3 transfer 75% of BPT to RewardDistributor
// 3. hold 25% for Quest Incentive Distribution (weekly recurring job with multisend)

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find campaign');

    // Check allowance for admin to ensure throughput
    const safe = await SafeService.findOneByPool(pool, pool.chainId);

    // Check balance to ensure throughput
    // const usdc = new ethers.Contract(
    //     USDC_ADDRESS,
    //     getAbiForContractName('LimitedSupplyToken') as unknown as ContractInterface,
    // );
    // const amount = BigNumber.from(req.body.amount);
    // const balance = await usdc.balanceOf(safe.address);
    // if (balance.lt(amount)) throw new InsufficientBalanceError('Insufficient USDC in campaign Safe for this topup');

    // const vault = new ethers.Contract(
    //     BALANCER_VAULT_ADDRESS,
    //     getAbiForContractName('BalancerVault') as unknown as ContractInterface,
    // );

    // Prepare company safe USDC transfer
    // const tx1 = await usdc.populateTransaction.transfer(COMPANY_SAFE_ADDRESS, amount);

    // joinPool(
    //     bytes32 poolId,
    //     address sender,
    //     address recipient,
    //     JoinPoolRequest request
    // )

    // struct JoinPoolRequest {
    //     address[] assets,
    //     uint256[] maxAmountsIn,
    //     bytes userData,
    //     bool fromInternalBalance
    // }

    // const tx2 = await vault.populateTransaction.joinPool(BALANCER_POOL_ID, safe.address, safe.address, {
    //     assets: [USDC_ADDRESS],
    //     maxAmountsIn: [amount.mul(0.75)],
    //     userData: JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
    //     fromInternalBalance: false,
    // });

    // const tx3 = await vault.populateTransaction.joinPool(BALANCER_POOL_ID, safe.address, safe.address, {
    //     assets: [USDC_ADDRESS],
    //     maxAmountsIn: [amount.mul(0.25)],
    //     userData: JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
    //     fromInternalBalance: false,
    // });

    // The batch to be sent. Order is important!
    // const payload: MetaTransactionData[] = [
    //     {
    //         to: USDC_ADDRESS,
    //         value: '0',
    //         data: tx1.data,
    //     },
    //     {
    //         to: BALANCER_VAULT_ADDRESS,
    //         value: '0',
    //         data: tx2.data,
    //     },
    //     {
    //         to: BALANCER_VAULT_ADDRESS,
    //         value: '0',
    //         data: tx3.data,
    //     },
    // ];

    // Execute the multisend

    res.status(200).end();
};

export default { validation, controller };
