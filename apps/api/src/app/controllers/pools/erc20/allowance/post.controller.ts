import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { getProvider } from '@thxnetwork/api/util/network';
import { getAbiForContractName } from '@thxnetwork/api/services/ContractService';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [
    param('id').isMongoId(),
    body('tokenAddress').isEthereumAddress(),
    body('spender').isEthereumAddress(),
    body('amountInWei').isString(),
];

export const controller = async (req: Request, res: Response) => {
    const poolId = req.params.id as string;
    const pool = await PoolService.getById(poolId);
    if (!pool) throw new NotFoundError('Pool not found');

    const safe = await SafeService.findOneByPool(pool);
    if (!safe) throw new NotFoundError('Wallet not found');

    const { web3 } = getProvider(safe.chainId);

    const abi = getAbiForContractName('LimitedSupplyToken');
    const contract = new web3.eth.Contract(abi, req.body.tokenAddress);
    const fn = contract.methods.approve(req.body.spender, req.body.amountInWei);

    // Propose tx data to relayer and return safeTxHash to track status
    const tx = await TransactionService.sendSafeAsync(safe, contract.options.address, fn);

    res.status(201).json([tx]);
};
export default { controller, validation };
