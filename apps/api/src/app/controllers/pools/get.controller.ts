import { Request, Response } from 'express';
import { param } from 'express-validator';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { Widget } from '@thxnetwork/api/services/WidgetService';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { Event } from '@thxnetwork/api/models/Event';
import PoolService from '@thxnetwork/api/services/PoolService';
import BrandService from '@thxnetwork/api/services/BrandService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import { Identity } from '@thxnetwork/api/models/Identity';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { logger } from '@thxnetwork/api/util/logger';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    let safe = await SafeService.findOneByPool(pool, pool.chainId);

    // Deploy a Safe if none is found
    if (!safe) {
        safe = await SafeService.create({
            chainId: pool.chainId,
            sub: pool.sub,
            safeVersion,
            poolId: req.params.id,
        });
        logger.info(`[${req.params.id}] Deployed Campaign Safe ${safe.address}`);
    }

    const [widget, brand, wallets, collaborators, owner, events, identities, subscriberCount] = await Promise.all([
        Widget.findOne({ poolId: req.params.id }),
        BrandService.get(req.params.id),
        Wallet.find({ poolId: req.params.id }),
        PoolService.findCollaborators(pool),
        AccountProxy.getById(pool.sub),
        Event.find({ poolId: pool._id }).distinct('name'), // Seperate list (many)
        Identity.find({ poolId: pool._id }), // Seperate list (many)
        PoolSubscription.countDocuments({ poolId: req.params.id }),
    ]);

    res.json({
        ...pool.toJSON(),
        address: pool.safeAddress,
        safe,
        identities,
        events,
        wallets,
        widget,
        brand,
        subscriberCount,
        owner,
        collaborators,
        latestVersion: currentVersion,
    });
};

export default { controller, validation };
