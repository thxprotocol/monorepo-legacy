import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { ChainId } from '@thxnetwork/types/enums';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import { safeVersion } from '@thxnetwork/api/config/contracts';

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

            // TODO Change ownership instead of create new Safe
            if (safeWallet && address !== account.address) {
                // safeWallet = await SafeService.changeOwner(safeWallet, oldOwner, newOwner);
                // Might need confirm (will happen on frontend app load)
            }

            // Deploy Safe if none exists
            if (!safeWallet) {
                safeWallet = await SafeService.create({ sub: account.sub, chainId, safeVersion }, address);
            }
        }

        // await SafeService.migrate(safeWallet);

        // Store address and other account updates
        account = await AccountProxy.update(req.auth.sub, { ...req.body, address });

        res.json(account);
    },
};
