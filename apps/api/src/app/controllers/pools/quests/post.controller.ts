import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { ChainId } from '@thxnetwork/common/enums';
import { isAddress } from 'web3-utils';
import { defaults } from '@thxnetwork/api/util/validation';
import QuestService from '@thxnetwork/api/services/QuestService';

const validationBaseQuest = [
    param('id').isMongoId(),
    ...defaults.quest,
    // Daily
    body('amounts')
        .optional()
        .custom((amounts) => {
            for (const amount of JSON.parse(amounts)) {
                if (isNaN(amount)) return false;
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
    body('kind').optional().isString(),
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
    body('threshold').optional().isString(),
    // Gitcoin
    //
];

const validation = [param('id').isMongoId(), ...validationBaseQuest];

const controller = async (req: Request, res: Response) => {
    const quest = await QuestService.create(req.body.variant, req.params.id, req.body, req.file);
    res.status(201).json(quest);
};

export default { controller, validation };
