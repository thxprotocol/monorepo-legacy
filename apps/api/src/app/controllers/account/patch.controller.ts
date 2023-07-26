import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { ChainId } from '@thxnetwork/types/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

export default {
    controller: async (req: Request, res: Response) => {
        // #swagger.tags = ['Account']
        let account = await AccountProxy.getById(req.auth.sub);
        let address = account.address;
        const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;

        // Recover user wallet address from signed message
        const { authRequestMessage, authRequestSignature } = req.body;
        if (account.variant !== AccountVariant.Metamask && authRequestMessage && authRequestSignature) {
            address = recoverSigner(authRequestMessage, authRequestSignature);
            logger.info(`[${req.auth.sub}] Recovered Signer: ` + address);

            if (address !== account.address) {
                const wallet = await SafeService.create({ sub: account.sub, chainId }, address);
                logger.info(`[${req.auth.sub}] Deployed Safe: ` + wallet.address);

                // Get all wallets for sub
                // Get all ERC20Token for walletId
                // Get all ERC721Token for walletId
                // Get all ERC1155Token for walletId
                // Schedule transfers for tokens to wallet.address
            }
        }

        account = await AccountProxy.update(req.auth.sub, { ...req.body, address });

        res.json(account);
    },
};
