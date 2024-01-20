import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { ChainId } from '@thxnetwork/types/enums';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

export default {
    controller: async (req: Request, res: Response) => {
        // #swagger.tags = ['Account']
        let account = await AccountProxy.getById(req.auth.sub);
        let address = account.address;

        const { authRequestMessage, authRequestSignature } = req.body;
        const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
        const isMetamask = account.variant === AccountVariant.Metamask;
        let safeWallet = await SafeService.findPrimary(req.auth.sub, chainId);

        if (!isMetamask && authRequestMessage && authRequestSignature) {
            // Recover address for not metamask user
            address = recoverSigner(authRequestMessage, authRequestSignature);

            // Consider access to oauthshare lost and deploy new wallet as we
            // can no longer sign in order to migrate
            if (safeWallet && address !== account.address) {
                safeWallet = await SafeService.reset(safeWallet, address);
            }

            // Deploy Safe if none exists
            if (!safeWallet) {
                safeWallet = await SafeService.create({ sub: account.sub, chainId, safeVersion }, address);
            }
        }

        // Store address and other account updates
        account = await AccountProxy.update(req.auth.sub, { ...req.body, address });

        res.json(account);
    },
};
