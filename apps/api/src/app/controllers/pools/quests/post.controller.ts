import { body, check, param } from 'express-validator';
import { Request, Response } from 'express';
import { questMap } from '@thxnetwork/api/services/QuestService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { ChainId, TInfoLink } from '@thxnetwork/common/lib/types';
import { v4 } from 'uuid';
import ImageService from '@thxnetwork/api/services/ImageService';
import { isAddress } from 'web3-utils';

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
    // Daily
    body('amounts')
        .optional()
        .custom((amounts) => {
            for (const amount of JSON.parse(amounts)) {
                if (isNaN(amount)) {
                    return false;
                }
            }
            return true;
        })
        .customSanitizer((amounts) => JSON.parse(amounts)),
    body('eventName').optional().isString(),
    // Invite
    body('successUrl')
        .optional()
        .custom((value) => {
            if (value === '' || isValidUrl(value)) return true;
            return false;
        }),
    body('isMandatoryReview').optional().isBoolean(),
    // Social
    body('platform').optional().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('contentMetadata').optional().isString(),
    // Custom
    body('limit').optional().isInt(),
    // Web3
    body('contracts')
        .optional()
        .customSanitizer((contracts) => {
            return JSON.parse(contracts).filter((contract: { address: string; chainId: ChainId }) =>
                isAddress(contract.address),
            );
        }),
    body('methodName').optional().isString(),
    body('threshold').optional().isInt(),
    // Gitcoin
    //
];

const validation = [param('id').isMongoId(), ...validationBaseQuest];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const poolId = req.params.id;
    const image = req.file && (await ImageService.upload(req.file));
    const ModelQuest = questMap[req.body.variant].models.quest;
    const uuid = v4();
    const quest = await ModelQuest.create({ ...req.body, image, uuid, poolId });

    res.json(quest);
};

export default { controller, validation };
