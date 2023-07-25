import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [
    body('erc721Id').exists().isMongoId(),
    body('erc721TokenId').exists().isMongoId(),
    body('to').exists().isString(),
    body('forceSync').optional().isBoolean(),
];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const erc721 = await ERC721.findById(req.body.erc721Id);
    if (!erc721) throw new NotFoundError('Could not find the ERC721');

    const erc721Token = await ERC721Token.findById(req.body.erc721TokenId);
    if (!erc721Token) throw new NotFoundError('Could not find token for wallet');

    const wallet = await WalletService.findPrimary(req.auth.sub, erc721.chainId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const owner = await erc721.contract.methods.ownerOf(erc721Token.tokenId).call();
    if (owner !== wallet.address) throw new ForbiddenError('Account is not owner of given tokenId');

    const tx = await ERC721Service.transferFromWallet(erc721, erc721Token, wallet, req.body.to);
    res.status(201).json(tx);
};
export default { controller, validation };
