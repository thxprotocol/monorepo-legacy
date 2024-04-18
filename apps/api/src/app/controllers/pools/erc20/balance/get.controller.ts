import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';

export const validation = [param('id').isMongoId(), query('tokenAddress').isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Campaign not found.');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Campaign Safe not found.');

    const contract = ContractService.getContractFromAbi(
        safe.chainId,
        ContractService.getAbiForContractName('LimitedSupplyToken'),
        req.query.tokenAddress as string,
    );
    const balanceInWei = await contract.methods.balanceOf(safe.address).call();

    res.json({ balanceInWei: String(balanceInWei) });
};

export default { controller, validation };
