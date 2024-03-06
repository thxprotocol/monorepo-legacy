import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [
    body('walletId').isMongoId(),
    body('erc1155Id').isMongoId(),
    body('erc1155TokenId').isMongoId(),
    body('erc1155Amount').isInt(),
    body('to').isString(),
];

export const controller = async (req: Request, res: Response) => {
    const erc1155 = await ERC1155.findById(req.body.erc1155Id);
    if (!erc1155) throw new NotFoundError('Could not find the ERC1155');

    const erc1155Token = await ERC1155Token.findById(req.body.erc1155TokenId);
    if (!erc1155Token) throw new NotFoundError('Could not find token for wallet');

    const wallet = await SafeService.findById(req.body.walletId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const balance = await erc1155.contract.methods.balanceOf(wallet.address, erc1155Token.tokenId).call();
    if (Number(balance) < Number(req.body.erc1155Amount)) throw new ForbiddenError('Insufficient balance');

    const receiverToken = await ERC1155Service.transferFrom(
        erc1155,
        wallet,
        req.body.to,
        erc1155Token,
        req.body.erc1155Amount,
    );
    const tx = await Transaction.findById(receiverToken.transactions[0]);

    res.status(201).json(tx);
};
export default { controller, validation };
