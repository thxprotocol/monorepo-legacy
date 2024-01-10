import { body, check, param } from 'express-validator';
import { Request, Response } from 'express';
import { questMap } from '@thxnetwork/api/services/QuestService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/common/lib/types';
import { v4 } from 'uuid';

const validationBaseQuest = [
    body('index').optional().isInt(),
    body('title').isString(),
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
    const ModelQuest = questMap[req.body.variant].models.quest;
    const uuid = v4();
    const quest = await ModelQuest.create({ ...req.body, uuid, poolId });

    res.json(quest);
};

export default { controller, validation };
