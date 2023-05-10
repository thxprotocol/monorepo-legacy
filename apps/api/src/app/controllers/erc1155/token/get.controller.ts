import { Request, Response } from 'express';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155 Token']
    const token = await ERC1155Service.queryMintTransaction(await ERC1155Service.findTokenById(req.params.id));
    if (!token) throw new NotFoundError('ERC1155Token not found');

    const erc1155 = await ERC1155Service.findById(token.erc1155Id);
    if (!erc1155) throw new NotFoundError('ERC1155 not found');

    const metadata = await ERC1155Service.findMetadataById(token.metadataId);
    if (!metadata) throw new NotFoundError('ERC1155Metadata not found');

    const balanceInWei = await erc1155.contract.methods.balanceOf(token.recipient, metadata.tokenId).call();
    const balance = fromWei(balanceInWei, 'ether');

    const tokenUri = token.tokenId ? await erc1155.contract.methods.uri(token.tokenId).call() : '';

    res.status(200).json({
        ...token.toJSON(),
        tokenUri,
        balance,
        erc1155: erc1155.toJSON(),
        metadata: metadata.toJSON(),
    });
};

export default { controller, validation };
