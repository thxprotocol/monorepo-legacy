import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { defaults } from '@thxnetwork/api/util/validation';
import RewardService from '@thxnetwork/api/services/RewardService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import SafeService from '@thxnetwork/api/services/SafeService';

const validationBaseQuest = [
    param('id').isMongoId(),
    param('rewardId').isMongoId(),
    ...defaults.reward,
    // Coin
    body('erc20Id').optional().isMongoId(),
    body('amount').optional().isInt({ gt: 0 }),
    // NFT
    body('erc721Id').optional().isString(),
    body('erc1155Id').optional().isString(),
    body('metadataIds').optional().isString(),
    body('tokenId').optional().isString(),
    body('claimLimit').optional().isInt(),
    body('claimAmount').optional().isInt({ lt: 5001 }),
    body('redirectUrl').optional().isURL({ require_tld: false }),
    // Coupon
    body('webshopURL').optional().isURL({ require_tld: false }),
    body('codes')
        .optional()
        .custom((value: string) => value && JSON.parse(value).length > 0),
    // Custom
    body('webhookId').optional().isMongoId(),
    body('metadata').optional().isString(),
    // DiscordRole
    body('discordRoleId').optional().isString(),
];

const validation = [param('id').isMongoId(), ...validationBaseQuest];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool');

    const reward = await RewardService.create(req.body.variant, req.params.id, req.body, req.file);

    res.status(201).json(reward);
};

export default { controller, validation };
