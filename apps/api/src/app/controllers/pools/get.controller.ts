import { Request, Response } from 'express';
import { param } from 'express-validator';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { Participant, Widget, Wallet, Event, Identity } from '@thxnetwork/api/models';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { logger } from '@thxnetwork/api/util/logger';
import { ethers } from 'ethers';
import PoolService from '@thxnetwork/api/services/PoolService';
import BrandService from '@thxnetwork/api/services/BrandService';
import SafeService from '@thxnetwork/api/services/SafeService';
import PaymentService from '@thxnetwork/api/services/PaymentService';

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

    // Create a galachain private key if none exists
    if (!pool.settings.galachainPrivateKey) {
        const privateKey = ethers.Wallet.createRandom().privateKey;
        await pool.updateOne({ 'settings.galachainPrivateKey': privateKey });
    }

    // Fetch all other campaign entities
    const [widget, brand, wallets, collaborators, owner, events, identities, subscriberCount, balance] =
        await Promise.all([
            Widget.findOne({ poolId: req.params.id }),
            BrandService.get(req.params.id),
            Wallet.find({ poolId: req.params.id }),
            PoolService.findCollaborators(pool),
            PoolService.findOwner(pool),
            Event.find({ poolId: pool._id }).distinct('name'), // Seperate list (many)
            Identity.find({ poolId: pool._id }), // Seperate list (many)
            Participant.countDocuments({ poolId: req.params.id, isSubscribed: true }),
            PaymentService.balanceOf(safe),
        ]);

    res.json({
        ...pool.toJSON(),
        balance,
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
