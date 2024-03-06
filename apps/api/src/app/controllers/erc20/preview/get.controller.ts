import { Request, Response } from 'express';
import { query } from 'express-validator';
import { ChainId } from '@thxnetwork/common/enums';
import ContractService from '@thxnetwork/api/services/ContractService';

const validation = [query('chainId').isInt(), query('address').isEthereumAddress()];

export const controller = async (req: Request, res: Response) => {
    const chainId = req.query.chainId as unknown as ChainId;
    const contractAddress = req.query.address as string;
    const contract = ContractService.getContractFromName(chainId, 'LimitedSupplyToken', contractAddress);
    const [name, symbol, totalSupplyInWei] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
    ]);

    res.json({ name, symbol, totalSupplyInWei });
};
export default { controller, validation };
