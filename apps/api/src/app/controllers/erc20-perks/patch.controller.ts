import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';
import ERC20PerkService from '@thxnetwork/api/services/ERC20PerkService';
import ImageService from '@thxnetwork/api/services/ImageService';

const validation = [
    param('id').isMongoId(),
    body('title').isString(),
    body('description').isString(),
    body('expiryDate').optional().isISO8601(),
    body('limit').isNumeric(),
    body('erc20Id').isMongoId(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('isPromoted').optional().isBoolean(),
    body('locks')
        .optional()
        .customSanitizer((locks) => locks && JSON.parse(locks)),
];

const controller = async (req: Request, res: Response) => {
    let reward = await ERC20PerkService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    const image = req.file && (await ImageService.upload(req.file));
    reward = await ERC20PerkService.update(reward, { ...req.body, image });
    return res.json(reward.toJSON());
};

export default { controller, validation };
