import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { Pool } from '@thxnetwork/api/models';

const validation = [query('contractAddress').isEthereumAddress(), query('tokenId').isInt()];

export const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);
    if (!pool) throw new NotFoundError('Pool not found');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Safe not found');

    const abi = ContractService.getAbiForContractName('THX_ERC1155');
    const contract = ContractService.getContractFromAbi(pool.chainId, abi, req.query.contractAddress as string);
    const balance = await contract.methods.balanceOf(safe.address, req.query.tokenId).call();

    res.json({ balance });
};
export default { controller, validation };
