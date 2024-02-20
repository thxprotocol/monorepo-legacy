import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('id').isMongoId(), param('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const token = await ERC1155Service.queryMintTransaction(await ERC1155Service.findTokenById(req.params.id));
    if (!token) throw new NotFoundError('ERC1155Token not found');

    const erc1155 = await ERC1155Service.findById(token.erc1155Id);
    if (!erc1155) throw new NotFoundError('ERC1155 not found');

    const metadata = await ERC1155Service.findMetadataById(token.metadataId);
    if (!metadata) throw new NotFoundError('ERC1155Metadata not found');

    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new NotFoundError('Wallet not found for account');

    const balance = await erc1155.contract.methods.balanceOf(wallet.address, metadata.tokenId).call();
    const tokenUri = token.tokenId ? await erc1155.contract.methods.uri(token.tokenId).call() : '';

    res.json({
        ...token.toJSON(),
        nft: erc1155.toJSON(),
        metadata: metadata.toJSON(),
        tokenUri,
        balance,
    });
};

export default { controller, validation };
