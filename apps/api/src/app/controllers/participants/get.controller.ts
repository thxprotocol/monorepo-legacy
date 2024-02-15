import { Request, Response } from 'express';
import { Participant } from '@thxnetwork/api/models/Participant';
import { query } from 'express-validator';
import IdentityService from '@thxnetwork/api/services/IdentityService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [query('poolId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const poolId = req.query.poolId as string;
    const query: { sub: string; poolId?: string } = { sub: req.auth.sub };
    if (poolId) query.poolId = poolId;

    // Get all participants for the authenticated user and optionally filter by poolId
    const participants = await Participant.find(query);

    // Run pool specific operations
    if (poolId) {
        const pool = await PoolService.getById(poolId);
        // Force connect account address as identity might be available
        await IdentityService.forceConnect(pool, req.account);

        // If no participants were found, create a participant for the authenticated user
        if (!participants.length) {
            const participant = await Participant.create({ poolId, sub: req.auth.sub });
            participants.push(participant);
        }
    }

    return res.json(participants);
};

export default { controller, validation };
