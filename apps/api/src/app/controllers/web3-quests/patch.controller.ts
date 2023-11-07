import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';
import { isAddress } from 'web3-utils';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { ChainId, QuestVariant } from '@thxnetwork/types/enums';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [
    param('id').optional().isMongoId(),
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => JSON.parse(value)),
    body('amount').optional().isInt({ gt: 0 }),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('contracts').customSanitizer((contracts) => {
        return JSON.parse(contracts).filter((contract: { address: string; chainId: ChainId }) =>
            isAddress(contract.address),
        );
    }),
    body('methodName').optional().isString(),
    body('expiryDate').optional().isISO8601(),
    body('threshold').optional().isInt(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await QuestService.update(QuestVariant.Web3, req.params.id, { ...req.body, image });

    res.status(201).json(quest);
};

export default { controller, validation };
