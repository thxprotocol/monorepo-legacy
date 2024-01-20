import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('address').isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub);
    if (!wallet) throw new NotFoundError('Could not find wallet for account.');

    const contract = ContractService.getContractFromName(
        wallet.chainId,
        'LimitedSupplyToken',
        req.query.address as string,
    );
    const [name, symbol, totalSupplyInWei] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
    ]);

    res.json({ name, symbol, totalSupplyInWei });
};
export default { controller, validation };
