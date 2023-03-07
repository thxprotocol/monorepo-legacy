import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['ERC1155']
    #swagger.responses[200] = { 
        description: "Get information of the ERC1155 contract.",
        schema: { $ref: '#/definitions/ERC1155' } } 
    */
    let erc1155 = await ERC1155Service.findById(req.params.id);

    if (!erc1155) throw new NotFoundError();
    // Check if pending transaction is mined.
    if (!erc1155.address) erc1155 = await ERC1155Service.queryDeployTransaction(erc1155);
    // Still no address.
    if (!erc1155.address) return res.send(erc1155);
    const owner = await erc1155.contract.methods.owner().call();

    const assetPool = await AssetPool.findOne({ erc1155Id: erc1155._id });
    const poolId = assetPool ? String(assetPool._id) : undefined;

    res.json({ ...erc1155.toJSON(), owner, poolId });
};

export default { controller, validation };
