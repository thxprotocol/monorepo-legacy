import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import SafeService from '@thxnetwork/api/services/SafeService';
import ContractService from '@thxnetwork/api/services/ContractService';

export const validation = [query('tokenAddress').isEthereumAddress(), query('spender').isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub);
    if (!wallet) throw new NotFoundError('Wallet not found for account');

    const contract = ContractService.getContractFromName(
        wallet.chainId,
        'LimitedSupplyToken',
        req.query.tokenAddress as string,
    );
    const allowanceInWei = await contract.methods.allowance(wallet.address, req.query.spender).call();

    res.json({ allowanceInWei: String(allowanceInWei) });
};
export default { controller, validation };
