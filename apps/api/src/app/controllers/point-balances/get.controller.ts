import { Request, Response } from 'express';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { Participant } from '@thxnetwork/api/models/Participant';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Balances']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const primaryWallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    if (!primaryWallet) return res.json({ balance: 0 });

    const query = { sub: req.auth.sub, poolId: pool._id };
    const isParticipantExisting = await Participant.exists(query);
    if (!isParticipantExisting) {
        await Participant.create(query);
    }

    const pointBalance = await PointBalance.findOne({ walletId: String(primaryWallet._id), poolId: String(pool._id) });
    return res.json({ balance: pointBalance ? pointBalance.balance : 0 });
};

export default { controller };
