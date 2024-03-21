import { body, checkSchema, param } from 'express-validator';
import { Request, Response } from 'express';
import { defaults } from '@thxnetwork/api/util/validation';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { RewardVariant } from '@thxnetwork/common/enums';
import RewardService from '@thxnetwork/api/services/RewardService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validationBaseQuest = [
    param('id').isMongoId(),
    ...defaults.reward,

    // Coin
    body('erc20Id').optional().isMongoId(),
    body('amount').optional().isInt({ gt: 0 }),

    // NFT
    body('erc721Id').optional().isString(),
    body('erc1155Id').optional().isString(),
    body('metadataIds').optional().isString(),
    body('tokenId').optional().isString(),

    // Coupon
    body('webshopURL').optional().isURL({ require_tld: false }),
    body('codes')
        .optional()
        .custom((value: string) => value && Array.isArray(JSON.parse(value)))
        .customSanitizer((value: string) => value && JSON.parse(value)),

    // Custom
    body('webhookId').optional().isMongoId(),
    body('metadata').optional().isString(),
    // DiscordRole
    body('discordRoleId').optional().isString(),
    // Galachain
    body('contractChannelName').optional().isString(),
    body('contractChaincodeName').optional().isString(),
    body('contractContractName').optional().isString(),
    body('tokenCollection').optional().isString(),
    body('tokenCategory').optional().isString(),
    body('tokenType').optional().isString(),
    body('tokenAdditionalKey').optional().isString(),
    body('amount').optional().isInt({ gt: 0 }),
];

const validation = [param('id').isMongoId(), ...validationBaseQuest];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool');
    const variant = req.params.variant as unknown as RewardVariant;
    const reward = await RewardService.create(variant, req.params.id, req.body, req.file);

    res.status(201).json(reward);
};

export default { controller, validation };
