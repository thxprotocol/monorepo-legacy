import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    let erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError();

    // Check if pending transaction is mined.
    if (!erc721.address) {
        erc721 = await ERC721Service.queryDeployTransaction(erc721);
    }

    // Still no address.
    if (!erc721.address) {
        return res.send(erc721);
    }

    const totalSupply = await erc721.contract.methods.totalSupply().call();
    const owner = await erc721.contract.methods.owner().call();

    res.json({ ...erc721.toJSON(), totalSupply, owner });
};

export default { controller, validation };
