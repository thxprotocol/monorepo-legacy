import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [
    query('tokenAddress').isEthereumAddress(),
    query('spender').isEthereumAddress(),
    query('walletId').isMongoId(),
];

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const contract = ContractService.getContractFromName(
        wallet.chainId,
        'LimitedSupplyToken',
        req.query.tokenAddress as string,
    );
    const allowanceInWei = await contract.methods.allowance(wallet.address, req.query.spender).call();

    res.json({ allowanceInWei: String(allowanceInWei) });
};
export default { controller, validation };
