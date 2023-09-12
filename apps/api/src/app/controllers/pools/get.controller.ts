import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { Widget } from '@thxnetwork/api/services/WidgetService';
import BrandService from '@thxnetwork/api/services/BrandService';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { Collaborator } from '@thxnetwork/api/models/Collaborator';
import { TCollaborator } from '@thxnetwork/types/interfaces';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool.address) return res.json(pool.toJSON());

    const widget = await Widget.findOne({ poolId: req.params.id });
    const brand = await BrandService.get(req.params.id);
    const subscriberCount = await PoolSubscription.countDocuments({ poolId: req.params.id });
    const wallets = await Wallet.find({ poolId: req.params.id, sub: { $exists: false } });
    const collaborators = await Promise.all(
        (
            await Collaborator.find({ poolId: req.params.id })
        ).map(async (collaborator: TCollaborator) => {
            if (collaborator.sub) {
                const account = await AccountProxy.getById(collaborator.sub);
                collaborator.account = account;
            }
            return collaborator;
        }),
    );

    res.json({
        ...pool.toJSON(),
        wallets,
        widget,
        brand,
        latestVersion: currentVersion,
        subscriberCount,
        collaborators,
    });
};

export default { controller, validation };
