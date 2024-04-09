import { Request, Response } from 'express';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { body, param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

import {} from '@thxnetwork/api/services/LiquidityService';
import { BigNumber, ContractInterface, ethers } from 'ethers';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import BalancerService from '@thxnetwork/api/services/BalancerService';
import { BALANCER_POOL_ID } from '@thxnetwork/api/config/secrets';

export const validation = [param('id').isMongoId(), body('erc20Id').exists().isMongoId(), body('amountInWei').exists()];

// TODO
// 1. Customer approves USDC for Campaign Safe for x allowance
// 2. Campaign Safe calls multiSend for multiple transactions
// 2.1 transfer 30% of USDC allowance to Company Safe
// 2.2 joinPool 70% of USDC allowance to BalancerVault
// 2.3 stake 100% of BPT
// 2.4 transfer 75% of BPTGauge to RewardDistributor
// 3. hold 25% of BPTGauge for Quest Incentives (or autocompounding)

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find campaign');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Could not find campaign Safe');

    // Check USDC balance for Safe to ensure throughput
    const usdc = new ethers.Contract(contractNetworks[safe.chainId].tokens.USDC, contractArtifacts['USDC'].abi);
    const amountInWei = BigNumber.from(req.body.amountInWei);
    const balance = await usdc.balanceOf(safe.address);
    if (balance.lt(amountInWei)) {
        throw new InsufficientBalanceError('Insufficient USDC in campaign Safe for this topup');
    }

    // 2.1 Prepare company safe USDC transfer
    const tx1 = await usdc.populateTransaction.transfer(
        contractNetworks[safe.chainId].CompanyMultiSig,
        req.body.amountInWei,
    );

    // 2.2 Prepare BalancerVault joinPool
    // const vault = new ethers.Contract(
    //     contractNetworks[safe.chainId].contracts.BalancerVault,
    //     contractArtifacts['BalancerVault'].abi,
    // );
    // const tx2 = await vault.populateTransaction.joinPool(BALANCER_POOL_ID, safe.address, safe.address, {
    //     assets: [USDC_ADDRESS],
    //     maxAmountsIn: [amount.mul(0.75)],
    //     userData: JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
    //     fromInternalBalance: false,
    // });

    // Example using existing service
    const joinPoolTransaction = await BalancerService.buildJoin(safe, req.body.amountInWei, '0', '50');
    const tx2 = joinPoolTransaction.data;

    // 2.3 Stake the BPT
    const bptGauge = new ethers.Contract(contractNetworks[safe.chainId].BPTGauge, contractArtifacts['BPTGauge'].abi);
    const tx3 = await bptGauge.populateTransaction.deposit(req.body.amountInWei);

    // 2.4 Transfer

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
