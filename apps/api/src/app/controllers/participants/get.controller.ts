import { Request, Response } from 'express';
import { Participant } from '@thxnetwork/api/models/Participant';
import { query } from 'express-validator';

const validation = [query('poolId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const { poolId } = req.query;
    const query: { sub: string; poolId?: string } = { sub: req.auth.sub };
    if (poolId) query.poolId = poolId as string;

    // Get all participants for the authenticated user and optionally filter by poolId
    const participants = await Participant.find(query);
    if (poolId && !participants.length) {
        // If a poolId filter was provided and no participants were found, create the participant.
        const participant = await Participant.create({ poolId, sub: req.auth.sub });
        participants.push(participant);
    }

    return res.json(participants);
};

export default { controller, validation };
