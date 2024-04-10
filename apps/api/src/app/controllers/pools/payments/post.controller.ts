import { Request, Response } from 'express';
import { InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { body, param } from 'express-validator';
import { BigNumber } from 'ethers';
import { getContract } from '@thxnetwork/api/services/ContractService';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import PaymentService from '@thxnetwork/api/services/PaymentService';

export const validation = [param('id').isMongoId(), body('amountInWei').exists()];

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

    // Assert USDC balance for Safe to ensure throughput
    const amountInWei = BigNumber.from(req.body.amountInWei);
    const addresses = contractNetworks[safe.chainId];
    const usdc = getContract('USDC', safe.chainId, addresses.USDC);
    const balance = await usdc.balanceOf(safe.address);
    if (balance.lt(amountInWei)) {
        throw new InsufficientBalanceError('Insufficient balance');
    }

    // Assert allowance for Safe to PaymentSplitter
    const allowance = await usdc.allowance(safe.address, addresses.THXPaymentSplitter);
    if (allowance.lt(amountInWei)) {
        throw new InsufficientBalanceError('Insufficient allowance');
    }

    console.log(balance, allowance);

    // Execute approve from Safe to PaymentSplitter
    await PaymentService.deposit(safe, amountInWei);

    res.status(201).end();
};

export default { validation, controller };
