import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { ChainId } from '@thxnetwork/types/enums';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import WalletService from '@thxnetwork/api/services/WalletService';

export default {
    controller: async (req: Request, res: Response) => {
        // #swagger.tags = ['Account']
        let account = await AccountProxy.getById(req.auth.sub);
        let address = account.address;

        const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
        const { authRequestMessage, authRequestSignature } = req.body;

        // Get the current primary wallet if one exists
        const existingPrimaryWallet = await WalletService.findPrimary(req.auth.sub, chainId);
        const isMetamask = account.variant === AccountVariant.Metamask;

        // Create wallet for metamask user and no existing primary wallet
        if (isMetamask && !existingPrimaryWallet) {
            const newPrimaryWallet = await SafeService.create({ sub: account.sub, chainId, address }, address);
            console.log(`[${req.auth.sub}] Metamask Wallet:`, newPrimaryWallet.address);
        }

        // Attempt to recover address for not metamask user
        if (!isMetamask && authRequestMessage && authRequestSignature) {
            address = recoverSigner(authRequestMessage, authRequestSignature);

            const safeVersion = '1.3.0';
            const isAddressNew = !account.address && address; // Should deploy new safe
            const isAddressChanged = account.address && address !== account.address; // Should change owner for existing safe

            if (
                // No wallet + address changed = Deploy new safe
                // No wallet + address new = Deploy new safe
                (!existingPrimaryWallet && (isAddressNew || isAddressChanged)) ||
                // No wallet + no new address + no new changed address = Deploy new safe
                (!existingPrimaryWallet && !isAddressNew && !isAddressChanged)
            ) {
                await SafeService.create({ sub: account.sub, chainId, safeVersion }, address);
            }
            // Existing Wallet + address changed = Deploy new safe + migrate assets
            if (existingPrimaryWallet && !existingPrimaryWallet.safeVersion && isAddressChanged) {
                const wallet = await SafeService.create({ sub: account.sub, chainId, safeVersion }, address);
                await SafeService.transferAll(existingPrimaryWallet, wallet);
            }
            // Existing Safe + address changed = Change safe owner
            if (existingPrimaryWallet && existingPrimaryWallet.safeVersion && isAddressChanged) {
                // Change ownership for account.address
            }
        }

        // Store address and other account updates
        account = await AccountProxy.update(req.auth.sub, { ...req.body, address });

        res.json(account);
    },
};
