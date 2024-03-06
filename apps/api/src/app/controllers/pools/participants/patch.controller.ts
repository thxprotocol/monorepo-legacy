import { Participant } from '@thxnetwork/api/models/Participant';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

export const validation = [
    param('id').isMongoId(),
    param('participantId').isMongoId(),
    body('pointBalance').optional().isInt({ min: 0 }),
];

export const controller = async (req: Request, res: Response) => {
    const participant = await Participant.findById(req.params.participantId);
    if (!participant) throw new NotFoundError('Participant not found.');

    let pointBalance;
    if (typeof req.body.pointBalance !== 'undefined') {
        const { balance } = await Participant.findOneAndUpdate(
            { poolId: participant.poolId, sub: participant.sub },
            { balance: Number(req.body.pointBalance) },
            { new: true, upsert: true },
        );
        pointBalance = balance;
    }

    res.json({ ...participant.toJSON(), pointBalance });
};

export default { controller, validation };
