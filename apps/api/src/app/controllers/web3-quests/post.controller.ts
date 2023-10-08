import { v4 } from 'uuid';
import { Request, Response } from 'express';
import { body, check } from 'express-validator';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { isAddress } from 'web3-utils';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { ChainId } from '@thxnetwork/types/enums';
import ImageService from '@thxnetwork/api/services/ImageService';

const validation = [
    body('index').isInt(),
    body('title').isString(),
    body('description').isString(),
    body('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => JSON.parse(value)),
    body('amount').isInt({ gt: 0 }),
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
    body('methodName').isString(),
    body('threshold').isInt(),
    body('infoLinks').customSanitizer((infoLinks) => {
        return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
    }),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await Web3Quest.create({ ...req.body, uuid: v4(), image, poolId });

    // PoolService.sendNotification(NoticficationVariant.Web3, quest);

    res.status(201).json(quest);
};

export default { controller, validation };
