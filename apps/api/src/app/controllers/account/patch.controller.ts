import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { getChainId, safeVersion } from '@thxnetwork/api/services/ContractService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

export default {
    controller: async (req: Request, res: Response) => {
        const { authRequestMessage, authRequestSignature } = req.body;
        let account = await AccountProxy.findById(req.auth.sub);
        let safeWallet = await SafeService.findPrimary(req.auth.sub);
        let address = account.address;

        if (account.variant !== AccountVariant.Metamask && authRequestMessage && authRequestSignature) {
            // Recover address for not metamask user
            address = recoverSigner(authRequestMessage, authRequestSignature);

            // Consider access to oauthshare lost and deploy new wallet as we
            // can no longer sign in order to migrate
            if (safeWallet && address !== account.address) {
                safeWallet = await SafeService.reset(safeWallet, address);
            }

            // Deploy Safe if none exists
            if (!safeWallet) {
                safeWallet = await SafeService.create(
                    { sub: account.sub, chainId: getChainId(), safeVersion },
                    address,
                );
            }
        }

        // Store address and other account updates
        account = await AccountProxy.update(req.auth.sub, { ...req.body, address });

        res.json(account);
    },
};
