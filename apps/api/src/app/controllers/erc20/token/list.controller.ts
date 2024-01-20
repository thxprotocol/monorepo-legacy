import { ERC20TokenDocument } from '@thxnetwork/api/models/ERC20Token';
import { Request, Response } from 'express';
import { TERC20, TERC20Token } from '@thxnetwork/types/interfaces';
import { fromWei } from 'web3-utils';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/types/enums';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import SafeService from '@thxnetwork/api/services/SafeService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';

const validation = [query('chainId').exists().isNumeric()];

export const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.query.chainId) as ChainId;
    const wallet = await SafeService.findPrimary(req.auth.sub, chainId);
    if (!wallet) throw new NotFoundError('Could not find the wallet for the user');

    const thxWallet = await SafeService.getWalletMigration(req.auth.sub, chainId);
    const tokens = await ERC20Service.getTokensForWallet(wallet);
    const result = await Promise.all(
        tokens.map(async (token: ERC20TokenDocument) => {
            try {
                const erc20 = await ERC20Service.getById(token.erc20Id);
                if (!erc20 || erc20.chainId !== chainId) return;

                const pendingWithdrawals = await WithdrawalService.getPendingWithdrawals(erc20, wallet);
                const walletBalanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
                const walletBalance = fromWei(walletBalanceInWei, 'ether');
                const migrationBalance = thxWallet
                    ? await erc20.contract.methods.balanceOf(thxWallet.address).call()
                    : 0;

                return Object.assign(token.toJSON() as TERC20Token, {
                    migrationBalance,
                    walletBalance,
                    pendingWithdrawals,
                    erc20,
                });
            } catch (error) {
                console.log(error);
            }
        }),
    );

    res.json(
        result.reverse().filter((token: TERC20Token & { erc20: TERC20 }) => {
            return token && chainId === token.erc20.chainId;
        }),
    );
};

export default { controller, validation };
