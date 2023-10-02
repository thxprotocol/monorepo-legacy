import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { isAddress } from 'web3-utils';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { ChainId } from '@thxnetwork/types/enums';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    param('id').optional().isMongoId(),
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('isPublished').optional().isBoolean(),
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
    body('threshold').optional().isInt(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    let quest = await Web3Quest.findById(req.params.id);
    if (poolId === quest.poolId) new ForbiddenError('Not your Web3 Quest');

    const image = req.file && (await ImageService.upload(req.file));
    quest = await Web3Quest.findByIdAndUpdate(req.params.id, { ...req.body, image, poolId }, { new: true });

    PoolService.sendNotification(quest);

    res.status(201).json(quest);
};

export default { controller, validation };
