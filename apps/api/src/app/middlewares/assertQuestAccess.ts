import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { QuestVariant } from '@thxnetwork/common/enums';
import { Response, Request, NextFunction } from 'express';
import { serviceMap } from '../services/interfaces/IQuestService';

// @dev For all social quests use QuestVariant.Twitter by default as we can not access the
// quest interaction type yet but have to assign the db collection
// in order to check quest access
export function assertQuestAccess(variant: QuestVariant) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const poolId = req.header('X-PoolId');
        const Quest = serviceMap[variant].models.quest;
        const quest = await Quest.findById(req.params.id);
        if (poolId !== quest.poolId) {
            throw new ForbiddenError(`Not your quest!`);
        }
        next();
    };
}
