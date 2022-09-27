import { Request, Response } from 'express';
import { param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import MemberService from '@thxnetwork/api/services/MemberService';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { sub, address, erc20Id, erc721Id } = req.assetPool;

    if (sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!address) return res.json(req.assetPool.toJSON());

    const erc20 = await ERC20Service.getById(erc20Id);
    const erc721 = await ERC721Service.findById(erc721Id);
    const result: any = {
        ...req.assetPool.toJSON(),
        metrics: {
            withdrawals: await WithdrawalService.countByPool(req.assetPool),
            members: await MemberService.countByPool(req.assetPool),
        },
    };

    if (erc20) {
        const [totalSupplyInWei, poolBalanceInWei] = await Promise.all([
            erc20.contract.methods.totalSupply().call(),
            erc20.contract.methods.balanceOf(req.assetPool.address).call(),
        ]);
        result.erc20 = {
            ...erc20.toJSON(),
            totalSupply: totalSupplyInWei,
            poolBalance: poolBalanceInWei,
        };
    }

    if (erc721) {
        const [totalSupplyInWei, poolBalanceInWei] = await Promise.all([
            erc721.contract.methods.totalSupply().call(),
            erc721.contract.methods.balanceOf(req.assetPool.address).call(),
        ]);
        result.erc721 = {
            ...erc721.toJSON(),
            totalSupply: totalSupplyInWei,
            poolBalance: poolBalanceInWei,
        };
    }

    res.json(result);
};

export default { controller, validation };
