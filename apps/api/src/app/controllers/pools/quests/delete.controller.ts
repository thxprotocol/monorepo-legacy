import { param } from 'express-validator';
import { Request, Response } from 'express';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { QuestVariant } from '@thxnetwork/common/enums';
import LockService from '@thxnetwork/api/services/LockService';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId(), param('variant').isInt(), param('questId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as QuestVariant;
    const poolId = req.params.id;
    const questId = req.params.questId;

    const quest = await QuestService.findById(variant, questId);
    if (quest.poolId !== poolId) throw new ForbiddenError('Not your quest.');

    await quest.deleteOne();

    // Remove all locks for this quest
    await LockService.removeAllLocks(questId);

    res.status(204).end();
};

export default { controller, validation };
