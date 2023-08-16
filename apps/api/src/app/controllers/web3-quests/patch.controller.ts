import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { isAddress } from 'web3-utils';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { ChainId } from '@thxnetwork/types/enums';

const validation = [
    param('id').optional().isMongoId(),
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('amount').optional().isInt({ gt: 0 }),
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
    if (poolId === quest.poolId) new ForbiddenError('Not your web3 quest.');

    quest = await Web3Quest.findByIdAndUpdate(req.params.id, { ...req.body, poolId }, { new: true });

    res.status(201).json(quest);
};

export default { controller, validation };
