import { Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { body, param } from 'express-validator';
import { toChecksumAddress } from 'web3-utils';
import { Pool, PoolDocument, Identity, Event, QuestCustom } from '@thxnetwork/api/models';
import IdentityService from '@thxnetwork/api/services/IdentityService';

const validation = [
    param('uuid').isUUID('4'),
    body('code').optional().isUUID(4),
    body('address')
        .optional()
        .isEthereumAddress()
        .customSanitizer((address) => toChecksumAddress(address)),
];

const controller = async (req: Request, res: Response) => {
    const customQuest = await QuestCustom.findOne({ uuid: req.params.uuid });
    if (!customQuest) throw new NotFoundError('Could not find a milestone reward for this token');

    const pool = await Pool.findById(customQuest.poolId);
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

export function getIdentityForCode(pool: PoolDocument, code: string) {
    return Identity.findOne({ poolId: pool._id, uuid: code });
}

// @peterpolman (FK still depends on this)
// This function should deprecate as soon as clients implement the wallet onboarding webhook
// Defaulting into identity derivation for the provided address. This will require FK to present derived
// identity uuids in their client in order to connect the identity to their account.
export function getIdentityForAddress(pool: PoolDocument, address: string) {
    return IdentityService.getIdentityForSalt(pool, address);
}

export default { validation, controller };
