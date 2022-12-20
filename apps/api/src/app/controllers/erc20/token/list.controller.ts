import { ERC20TokenDocument } from '@thxnetwork/api/models/ERC20Token';
import { Request, Response } from 'express';
import { TERC20, TERC20Token } from '@thxnetwork/api/types/TERC20';
import { fromWei } from 'web3-utils';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WalletService from '@thxnetwork/api/services/WalletService';

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
            const erc20 = await ERC20Service.getById(token.erc20Id);

            const wallet = await WalletService.findOneByQuery({ sub: req.auth.sub, chainId: erc20.chainId });
            const walletBalanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
            const walletBalance = Number(fromWei(walletBalanceInWei, 'ether'));

            const balanceInWei = await erc20.contract.methods.balanceOf(account.walletAddress).call();
            const balance = Number(fromWei(balanceInWei, 'ether'));

            const logoImg = erc20.logoImgUrl || `https://avatars.dicebear.com/api/identicon/${erc20.address}.svg`;

            return { ...(token.toJSON() as TERC20Token), balanceInWei, balance, walletBalance, erc20, logoImg };
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
