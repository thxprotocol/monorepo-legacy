import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService, { getChainId } from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('tokenAddress').isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const chainId = getChainId();
    const wallet = await SafeService.findOne({ sub: req.auth.sub, chainId });
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const contract = ContractService.getContractFromAbi(
        wallet.chainId,
        ContractService.getAbiForContractName('LimitedSupplyToken'),
        req.query.tokenAddress as string,
    );
    const balanceInWei = await contract.methods.balanceOf(wallet.address).call();

    res.json({ balanceInWei });
};
export default { controller, validation };
