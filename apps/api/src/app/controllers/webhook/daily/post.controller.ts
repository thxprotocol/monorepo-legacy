import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { getIdentityForAddress, getIdentityForCode } from '../milestones/claim/post.controller';
import { Event } from '@thxnetwork/api/models/Event';
import { Pool, QuestDaily } from '@thxnetwork/api/models';

const validation = [
    param('uuid').isUUID('4'),
    body('code').optional().isUUID(4),
    body('address').optional().isEthereumAddress(),
];

const controller = async (req: Request, res: Response) => {
    const quest = await QuestDaily.findOne({ eventName: req.params.uuid });
    if (!quest) throw new NotFoundError('Could not find a daily reward for this token');

    const pool = await Pool.findById(quest.poolId);
    if (!pool) throw new NotFoundError('Could not find a campaign pool for this reward.');

    if (!req.body.code && !req.body.address) {
        throw new BadRequestError('This request requires either a wallet code or address');
    }

    const identity = req.body.code
        ? await getIdentityForCode(pool, req.body.code)
        : await getIdentityForAddress(pool, req.body.address);

    await Event.create({ name: quest.eventName, identityId: identity._id, poolId: pool._id });

    res.status(201).end();
};

export default { validation, controller };
