import { ERC20TokenDocument } from '@thxnetwork/api/models/ERC20Token';
import { Request, Response } from 'express';
import { TERC20, TERC20Token } from '@thxnetwork/api/types/TERC20';
import { fromWei } from 'web3-utils';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Token']
    #swagger.responses[200] = { 
        description: 'Get a list of ERC20 tokens for this user.',
        schema: { 
            type: 'array',
            items: { 
                $ref: '#/definitions/ERC20Token',
            } 
        }
    }
    */
    const account = await AccountProxy.getById(req.auth.sub);
    const tokens = await ERC20Service.getTokensForSub(req.auth.sub);
    const result = await Promise.all(
        tokens.map(async (token: ERC20TokenDocument) => {
            try {
                const erc20 = await ERC20Service.getById(token.erc20Id);
                if (!erc20) return;
                if (erc20.chainId !== Number(req.query.chainId)) return { ...(token.toJSON() as TERC20Token), erc20 };

                const pendingWithdrawals = await WithdrawalService.getPendingWithdrawals(erc20, account);
                const walletAddress = await account.getAddress(erc20.chainId);

                let walletBalanceInWei, walletBalance;
                if (walletAddress) {
                    walletBalanceInWei = await erc20.contract.methods.balanceOf(walletAddress).call();
                    walletBalance = Number(fromWei(walletBalanceInWei, 'ether'));
                }

                let balanceInWei, balance, balancePending;
                if (account.address) {
                    balanceInWei = await erc20.contract.methods.balanceOf(account.address).call();
                    balance = Number(fromWei(balanceInWei, 'ether'));
                    balancePending = pendingWithdrawals
                        .map((item: any) => item.amount)
                        .reduce((prev: any, curr: any) => prev + curr, 0);
                }

                erc20.logoImgUrl =
                    erc20.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${erc20.address}.svg`;

                return {
                    ...(token.toJSON() as TERC20Token),
                    balanceInWei,
                    balance,
                    balancePending,
                    walletBalance,
                    pendingWithdrawals,
                    erc20,
                };
            } catch (error) {
                console.log(error);
            }
        }),
    );

    res.json(
        result.filter((token: TERC20Token & { erc20: TERC20 }) => {
            if (!req.query.chainId) return true;
            return Number(req.query.chainId) === token.erc20.chainId;
        }),
    );
};

export default { controller };
