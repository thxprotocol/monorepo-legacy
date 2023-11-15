import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { Widget } from '@thxnetwork/api/services/WidgetService';
import BrandService from '@thxnetwork/api/services/BrandService';
import { PoolSubscription } from '@thxnetwork/api/models/PoolSubscription';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { Collaborator, CollaboratorDocument } from '@thxnetwork/api/models/Collaborator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool.address) return res.json(pool.toJSON());

    const widget = await Widget.findOne({ poolId: req.params.id });
    const brand = await BrandService.get(req.params.id);
    const subscriberCount = await PoolSubscription.countDocuments({ poolId: req.params.id });
    const wallets = await Wallet.find({ poolId: req.params.id });
    const collabs = await Collaborator.find({ poolId: req.params.id });
    const collaborators = await Promise.all(
        collabs.map(async (collaborator: CollaboratorDocument) => {
            if (collaborator.sub) {
                const account = await AccountProxy.getById(collaborator.sub);
                return { ...collaborator.toJSON(), account };
            }
            return collaborator;
        }),
    );
    const owner = await AccountProxy.getById(pool.sub);
    const guilds = await DiscordGuild.find({ poolId: pool._id });

    res.json({
        ...pool.toJSON(),
        wallets,
        widget,
        brand,
        guilds,
        latestVersion: currentVersion,
        subscriberCount,
        owner,
        collaborators,
    });
};

export default { controller, validation };
