import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { Response, Request, NextFunction } from 'express';
import { questMap } from '@thxnetwork/api/services/QuestService';

// @dev For all social quests use QuestVariant.Twitter by default as we can not access the
// quest interaction type yet but have to assign the db collection
// in order to check quest access
export function assertQuestAccess(variant: QuestVariant) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const poolId = req.header('X-PoolId');
        const model = questMap[variant].models.quest;
        const quest = await model.findById(req.params.id);
        if (poolId !== quest.poolId) {
            throw new ForbiddenError(`Not your quest!`);
        }
        next();
    };
}
