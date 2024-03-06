import { ERC20TokenDocument } from '@thxnetwork/api/models/ERC20Token';
import { Request, Response } from 'express';
import { fromWei } from 'web3-utils';
import { query } from 'express-validator';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('walletId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC20Service.getTokensForWallet(wallet);
    const result = await Promise.all(
        tokens.map(async (token: ERC20TokenDocument) => {
            try {
                const erc20 = await ERC20Service.getById(token.erc20Id);
                if (!erc20 || erc20.chainId !== wallet.chainId) return;

                const walletBalanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
                const walletBalance = fromWei(walletBalanceInWei, 'ether');

                return Object.assign(token.toJSON() as TERC20Token, {
                    walletBalance,
                    erc20,
                });
            } catch (error) {
                console.log(error);
            }
        }),
    );

    res.json(
        result.reverse().filter((token: TERC20Token & { erc20: TERC20 }) => {
            return token && wallet.chainId === token.erc20.chainId;
        }),
    );
};

export default { controller, validation };
