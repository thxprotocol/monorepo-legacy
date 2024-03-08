import { QRCodeEntry, RewardNFT } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('uuid').isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new NotFoundError('QR Code Entry not found');

    const reward = await RewardNFT.findById(entry.rewardId);
    if (!reward) throw new NotFoundError('Reward not found');

    const isAllowed = await PoolService.isSubjectAllowed(req.auth.sub, reward.poolId);
    if (!isAllowed) throw new ForbiddenError('Not allowed for delete.');

    await entry.deleteOne();

    res.status(204).end();
};

export default { controller, validation };
