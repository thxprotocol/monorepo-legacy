import { Participant } from '@thxnetwork/api/models/Participant';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import SafeService from '@thxnetwork/api/services/SafeService';
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
        const wallet = await SafeService.findPrimary(participant.sub);
        if (!wallet) throw new NotFoundError('Wallet not found.');

        pointBalance = await PointBalance.findOneAndUpdate(
            { poolId: participant.poolId, walletId: wallet._id },
            { balance: Number(req.body.pointBalance) },
        );
    }

    res.json({ ...participant, pointBalance });
};

export default { controller, validation };
