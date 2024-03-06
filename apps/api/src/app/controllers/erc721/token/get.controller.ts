import { Request, Response } from 'express';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const token = await ERC721Token.findById(req.params.id);
    if (!token) throw new NotFoundError('ERC721Token not found');

    const [erc721, metadata] = await Promise.all([
        ERC721Service.findById(token.erc721Id),
        ERC721Metadata.findById(token.metadataId),
    ]);
    if (!erc721) throw new NotFoundError('ERC721 not found');
    if (!metadata) throw new NotFoundError('ERC721Metadata not found');

    const balanceInWei = await erc721.contract.methods.balanceOf(token.recipient).call();
    const balance = Number(fromWei(balanceInWei, 'ether'));

    const [owner, tokenUri] = token.tokenId
        ? await Promise.all([
              erc721.contract.methods.ownerOf(token.tokenId).call(),
              erc721.contract.methods.tokenURI(token.tokenId).call(),
          ])
        : [];

    res.status(200).json({
        ...token.toJSON(),
        owner,
        tokenUri,
        balance,
        nft: erc721.toJSON(),
        metadata: metadata.toJSON(),
    });
};

export default { controller, validation };
