import { Request, Response } from 'express';
import { InsufficientAllowanceError, InsufficientBalanceError, NotFoundError } from '@thxnetwork/api/util/errors';
import { body, param } from 'express-validator';
import { BigNumber } from 'ethers';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import PaymentService from '@thxnetwork/api/services/PaymentService';

export const validation = [param('id').isMongoId(), body('amountInWei').exists(), body('planType').isInt()];

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

    const amountInWei = BigNumber.from(req.body.amountInWei);
    const addresses = contractNetworks[safe.chainId];

    // Assert USDC balance for Safe to ensure throughput
    const { web3 } = getProvider(safe.chainId);
    const usdc = new web3.eth.Contract(contractArtifacts['USDC'].abi, addresses.USDC);
    const balance = await usdc.methods.balanceOf(safe.address).call();
    if (BigNumber.from(balance).lt(amountInWei)) {
        throw new InsufficientBalanceError();
    }

    // Assert allowance for Safe to PaymentSplitter
    const allowance = await usdc.methods.allowance(safe.address, addresses.THXPaymentSplitter).call();
    if (BigNumber.from(allowance).lt(amountInWei)) {
        throw new InsufficientAllowanceError();
    }

    // Execute approve from Safe to PaymentSplitter
    await PaymentService.deposit(safe, req.auth.sub, amountInWei);

    res.status(201).end();
};

export default { validation, controller };
