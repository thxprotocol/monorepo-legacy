import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('id').isMongoId(), param('metadataId').isMongoId(), body('recipient').isEthereumAddress()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const metadata: ERC721MetadataDocument = await ERC721Service.findMetadataById(req.params.metadataId);
    if (!metadata) throw new NotFoundError('Could not find this NFT metadata in the database');

    const tokens = await ERC721Service.findTokensByMetadata(metadata);
    const account = await AccountProxy.getByAddress(req.body.recipient);
    if (!account) throw new ForbiddenError('You can currently only mint to THX Web Wallet addresses');
    const token = await ERC721Service.mint(req.assetPool, erc721, metadata, account);

    tokens.push(token);

    res.status(201).json({ ...metadata.toJSON(), tokens });
};

export default { controller, validation };
