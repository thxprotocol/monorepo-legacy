import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [
    body('walletId').isMongoId(),
    body('erc721Id').isMongoId(),
    body('erc721TokenId').isMongoId(),
    body('to').isString(),
];

export const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721.findById(req.body.erc721Id);
    if (!erc721) throw new NotFoundError('Could not find the ERC721');

    const erc721Token = await ERC721Token.findById(req.body.erc721TokenId);
    if (!erc721Token) throw new NotFoundError('Could not find token for wallet');

    const wallet = await SafeService.findById(req.body.walletId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const owner = await erc721.contract.methods.ownerOf(erc721Token.tokenId).call();
    if (owner !== wallet.address) throw new ForbiddenError('Account is not owner of given tokenId');

    const receiverToken = await ERC721Service.transferFrom(erc721, wallet, req.body.to, erc721Token);
    const tx = await Transaction.findById(receiverToken.transactions[0]);

    res.status(201).json(tx);
};
export default { controller, validation };
