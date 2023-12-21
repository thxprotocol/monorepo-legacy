import { Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { body, param } from 'express-validator';
import { v4 } from 'uuid';
import { toChecksumAddress } from 'web3-utils';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { Identity } from '@thxnetwork/api/models/Identity';
import { Event } from '@thxnetwork/api/models/Event';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [
    param('uuid').isUUID('4'),
    body('code').optional().isUUID(4),
    body('address')
        .optional()
        .isEthereumAddress()
        .customSanitizer((address) => toChecksumAddress(address)),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const customQuest = await MilestoneReward.findOne({ uuid: req.params.uuid });
    if (!customQuest) throw new NotFoundError('Could not find a milestone reward for this token');

    const pool = await AssetPool.findById(customQuest.poolId);
    if (!pool) throw new NotFoundError('Could not find a campaign pool for this reward.');

    if (!req.body.code && !req.body.address) {
        throw new BadRequestError('This request requires either a wallet code or address');
    }

    const identity = req.body.code
        ? await getIdentityForCode(pool, req.body.code)
        : await getIdentityForAddress(pool, req.body.address);

    await Event.create({ name: customQuest.eventName, identityId: identity._id, poolId: pool._id });

    res.status(201).end();
};

export function getIdentityForCode(pool: AssetPoolDocument, code: string) {
    return Identity.findOne({ poolId: pool._id, uuid: code });
}

// @peterpolman (FK still depends on this)
// This function should deprecate as soon as clients implement the wallet onboarding webhook
export async function getIdentityForAddress(pool: AssetPoolDocument, address: string) {
    // Find the virtual wallet for this address
    let virtualWallet = await Wallet.findOne({ poolId: pool._id, chainId: pool.chainId, address });

    // If no wallet is found for this address then create a virtual wallet
    if (!virtualWallet) {
        const uuid = v4();
        virtualWallet = await Wallet.create({
            uuid,
            poolId: pool._id,
            chainId: pool.chainId,
            address,
        });
    }

    // If an account is found for this address, we can instantly connect the Identity
    const account = await AccountProxy.getByAddress(address);

    // Always upsert and Identity to support the modern SDK implementation
    return await Identity.findOneAndUpdate(
        { poolId: pool._id, uuid: virtualWallet.uuid },
        // If an account is found for this address, connect the Identity
        { poolId: pool._id, uuid: virtualWallet.uuid, sub: account && account.sub },
        { upsert: true, new: true },
    );
}

export default { validation, controller };
