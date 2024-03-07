import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [query('walletId').isMongoId(), query('tokenAddress').isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const contract = ContractService.getContractFromAbi(
        wallet.chainId,
        ContractService.getAbiForContractName('LimitedSupplyToken'),
        req.query.tokenAddress as string,
    );
    const balanceInWei = await contract.methods.balanceOf(wallet.address).call();

    res.json({ balanceInWei });
};
export default { controller, validation };
