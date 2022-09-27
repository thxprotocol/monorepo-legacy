import { Request, Response } from 'express';
import { body } from 'express-validator';
import { isAddress } from 'web3-utils';

import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { checkAndUpgradeToBasicPlan } from '@thxnetwork/api/util/plans';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import { ADDRESS_ZERO } from '@thxnetwork/api/config/secrets';

const validation = [
    body('erc20tokens').custom((tokens: string[]) => {
        for (const tokenAddress of tokens) {
            if (!isAddress(tokenAddress)) return false;
        }
        return true;
    }),
    body('erc721tokens')
        .optional()
        .custom((tokens: string[]) => {
            for (const tokenAddress of tokens) {
                if (!isAddress(tokenAddress)) return false;
            }
            return true;
        }),
    body('chainId').exists().isNumeric(),
    body('variant').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const account = await AccountProxy.getById(req.auth.sub);

    await checkAndUpgradeToBasicPlan(account, req.body.chainId);

    const pool = await AssetPoolService.deploy(
        req.auth.sub,
        req.body.chainId,
        req.body.erc20tokens && req.body.erc20tokens.length ? req.body.erc20tokens[0] : ADDRESS_ZERO,
        req.body.erc721tokens && req.body.erc721tokens.length ? req.body.erc721tokens[0] : ADDRESS_ZERO,
    );

    const client = await ClientProxy.create(req.auth.sub, String(pool._id), {
        application_type: 'web',
        grant_types: ['client_credentials'],
        request_uris: [],
        redirect_uris: [],
        post_logout_redirect_uris: [],
        response_types: [],
        scope: 'openid account:read account:write members:read members:write withdrawals:write',
    });

    await pool.updateOne({
        clientId: client.clientId,
    });

    res.status(201).json(pool);
};

export default { controller, validation };
