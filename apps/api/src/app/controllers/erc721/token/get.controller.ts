import { Request, Response } from 'express';
import { param } from 'express-validator';
import { fromWei } from 'web3-utils';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';

const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Token']
    const token = await ERC721Token.findById(req.params.id);
    if (!token) throw new NotFoundError('ERC721Token not found');

    const erc721 = await ERC721Service.findById(token.erc721Id);
    if (!erc721) throw new NotFoundError('ERC721 not found');

    const metadata = await ERC721Metadata.findById(token.metadataId);
    if (!metadata) throw new NotFoundError('ERC721Metadata not found');

    const balanceInWei = await erc721.contract.methods.balanceOf(token.recipient).call();
    const balance = Number(fromWei(balanceInWei, 'ether'));

    const owner = await erc721.contract.methods.ownerOf(token.tokenId).call();
    const tokenUri = token.tokenId ? await erc721.contract.methods.tokenURI(token.tokenId).call() : '';
    erc721.logoImgUrl = erc721.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${erc721.address}`;

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
