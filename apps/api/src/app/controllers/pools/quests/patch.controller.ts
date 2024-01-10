import { body, check, param } from 'express-validator';
import { Request, Response } from 'express';
import { questMap } from '@thxnetwork/api/services/QuestService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/common/lib/types';

const validationBaseQuest = [
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => JSON.parse(value)),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('expiryDate').optional().isISO8601(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) =>
            JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url)),
        ),
    body('locks')
        .optional()
        .custom((value) => {
            const locks = JSON.parse(value);
            return Array.isArray(locks);
        })
        .customSanitizer((locks) => JSON.parse(locks)),
];

const validation = [param('id').isMongoId(), ...validationBaseQuest];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const poolId = req.params.id;
    const questId = req.params.questId;
    const ModelQuest = questMap[req.body.variant].models.quest;
    const quest = await ModelQuest.findByIdAndUpdate(questId, { ...req.body, poolId }, { new: true });

    res.json(quest);
};

export default { controller, validation };
