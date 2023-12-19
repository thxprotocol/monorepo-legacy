import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { isAddress, toChecksumAddress } from 'web3-utils';
import { getIdentityForAddress, getIdentityForCode } from '../milestones/claim/post.controller';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { Event } from '@thxnetwork/api/models/Event';

const validation = [
    param('eventName').isUUID(4),
    body('code').optional().isUUID(4),
    body('address')
        .optional()
        .custom((address) => isAddress(address))
        .customSanitizer((address) => toChecksumAddress(address)),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const reward = await DailyReward.findOne({ uuid: req.params.token });
    if (!reward) throw new NotFoundError('Could not find a daily reward for this token');

    const pool = await AssetPool.findById(reward.poolId);
    if (!pool) throw new NotFoundError('Could not find a campaign pool for this reward.');

    if (!req.body.code && !req.body.address) {
        throw new BadRequestError('This request requires either a wallet code or address');
    }

    const identity = req.body.code
        ? await getIdentityForCode(pool, req.body.code)
        : await getIdentityForAddress(pool, req.body.address);

    await Event.create({ name: req.params.eventName, identityId: identity._id, poolId: pool._id });

    res.status(201).end();
};

export default { validation, controller };
