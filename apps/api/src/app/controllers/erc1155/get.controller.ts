import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    let erc1155 = await ERC1155Service.findById(req.params.id);

    if (!erc1155) throw new NotFoundError();
    // Check if pending transaction is mined.
    if (!erc1155.address) erc1155 = await ERC1155Service.queryDeployTransaction(erc1155);
    // Still no address.
    if (!erc1155.address) return res.send(erc1155);
    const owner = await erc1155.contract.methods.owner().call();

    res.json({ ...erc1155.toJSON(), owner });
};

export default { controller, validation };
