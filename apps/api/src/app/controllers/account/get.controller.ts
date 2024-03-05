import { Request, Response } from 'express';
import { WalletVariant, AccountVariant } from '@thxnetwork/common/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WalletService from '@thxnetwork/api/services/WalletService';
import { getChainId } from '@thxnetwork/api/services/ContractService';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    // Remove actual tokens from response
    account.tokens = account.tokens.map(({ kind, userId, scopes, metadata }) => ({
        kind,
        userId,
        scopes,
        metadata,
    })) as TToken[];

    // If account variant is metamask and no wallet is found then create it
    if (account.variant === AccountVariant.Metamask) {
        const wallet = await WalletService.findOne({ sub: req.auth.sub, variant: WalletVariant.WalletConnect });
        if (!wallet) {
            await WalletService.createWalletConnect({
                sub: req.auth.sub,
                address: account.address,
                chainId: getChainId(),
            });
        }
    }

    res.json(account);
};

export default { controller, validation };
