import { Request, Response } from 'express';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import MemberService from '@thxnetwork/api/services/MemberService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { getContractFromName } from '@thxnetwork/api/config/contracts';

const validation = [param('address').isEthereumAddress()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Members']
    const isMember = await MemberService.isMember(req.assetPool, req.params.address);

    if (!isMember) throw new NotFoundError();

    const member = await MemberService.getByAddress(req.assetPool, req.params.address);
    const erc20 = await ERC20Service.findByPool(req.assetPool);
    const contract = getContractFromName(req.assetPool.chainId, 'LimitedSupplyToken', erc20.address);
    const balance = Number(fromWei(await contract.methods.balanceOf(member.address).call()));

    res.json({ ...member, token: { name: erc20.name, symbol: erc20.symbol, balance } });
};

export default { controller, validation };
