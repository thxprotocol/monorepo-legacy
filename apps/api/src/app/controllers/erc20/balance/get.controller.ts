import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('tokenAddress').isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const contract = ContractService.getContractFromAbi(
        wallet.chainId,
        ContractService.getAbiForContractName('LimitedSupplyToken'),
        req.query.tokenAddress as string,
    );
    const balance = await contract.methods.balanceOf(req.params.tokenAddress).call();

    res.json({ balance });
};
export default { controller, validation };
