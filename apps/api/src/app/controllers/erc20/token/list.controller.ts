import { Request, Response } from 'express';
import { query } from 'express-validator';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('walletId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC20Service.getTokensForWallet(wallet);

    res.json(
        tokens.reverse().filter((token: TERC20Token & { erc20: TERC20 }) => {
            return token && wallet.chainId === token.erc20.chainId;
        }),
    );
};

export default { controller, validation };
