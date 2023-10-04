import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { Response, Request, NextFunction } from 'express';
import QuestService from '@thxnetwork/api/services/QuestService';

export function assertQuestAccess(variant: QuestVariant) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const poolId = req.header('X-PoolId');
        const model = QuestService.getModel(variant);
        const quest = await model.findById(req.params.id);
        if (poolId === quest.poolId) {
            new ForbiddenError(`Not your quest!`);
        }
        next();
    };
}
