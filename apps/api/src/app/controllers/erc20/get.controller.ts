import { Request, Response } from 'express';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { getProvider } from '@thxnetwork/api/util/network';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Contract']
    #swagger.responses[200] = { 
            description: 'Get an ERC20 contract for this user.',
            schema: { $ref: '#/definitions/ERC20' } 
    }
    */
    let erc20 = await ERC20Service.queryDeployTransaction(await ERC20Service.getById(req.params.id));
    if (!erc20) throw new NotFoundError('ERC20 not found');

    // Check if pending transaction is mined.
    if (!erc20.address) erc20 = await ERC20Service.queryDeployTransaction(erc20);

    // Still no address.
    if (!erc20.address) return res.send(erc20);

    const { defaultAccount } = getProvider(erc20.chainId);
    const [totalSupplyInWei, decimalsString, adminBalanceInWei] = await Promise.all([
        erc20.contract.methods.totalSupply().call(),
        erc20.contract.methods.decimals().call(),
        erc20.contract.methods.balanceOf(defaultAccount).call(),
    ]);
    const totalSupply = Number(fromWei(totalSupplyInWei, 'ether'));
    const decimals = Number(decimalsString);
    const adminBalance = Number(fromWei(adminBalanceInWei, 'ether'));

    const assetPool = await AssetPool.findOne({ erc20Id: erc20._id });
    const poolId = assetPool ? String(assetPool._id) : undefined;

    res.status(200).json({
        ...erc20.toJSON(),
        totalSupply,
        decimals,
        adminBalance,
        poolId,
    });
};

export default { controller, validation };
