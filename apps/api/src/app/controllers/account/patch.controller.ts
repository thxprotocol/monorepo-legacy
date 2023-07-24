import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/types/enums';
import SafeService from '@thxnetwork/api/services/SafeService';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { logger } from '@thxnetwork/api/util/logger';

export default {
    controller: async (req: Request, res: Response) => {
        // #swagger.tags = ['Account']
        let account = await AccountProxy.getById(req.auth.sub);
        let address = account.address;
        const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;

        // Recover user wallet address from signed message
        if (req.body.authRequestMessage && req.body.authRequestSignature) {
            address = recoverSigner(req.body.authRequestMessage, req.body.authRequestSignature);
            logger.info(`[${req.auth.sub}] Recovered Signer: ` + address);

            if (address !== account.address) {
                const wallet = await SafeService.create({ sub: account.sub, chainId }, address);
                logger.info(`[${req.auth.sub}] Deployed Safe: ` + wallet.address);
            }
        }

        account = await AccountProxy.update(req.auth.sub, { ...req.body, address });

        res.json(account);
    },
};
