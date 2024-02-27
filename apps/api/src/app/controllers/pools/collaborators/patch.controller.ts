import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Collaborator } from '@thxnetwork/api/models/Collaborator';
import { CollaboratorInviteState } from '@thxnetwork/common/enums';
import PoolService from '@thxnetwork/api/services/PoolService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

export const validation = [param('id').isMongoId(), param('uuid').isUUID(4)];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const collaborator = await Collaborator.findOne({ poolId: req.params.id, uuid: req.params.uuid });
    if (!collaborator) throw new NotFoundError('Could not find collaboration invite');

    if (pool.sub !== req.body.sub) {
        await collaborator.updateOne({
            sub: req.auth.sub,
            state: CollaboratorInviteState.Accepted,
        });
    }

    res.end();
};

export default { controller, validation };
