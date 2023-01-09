import { body, check } from 'express-validator';
import { Request, Response } from 'express';
import { createERC20Perk } from '@thxnetwork/api/util/rewards';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { ERC20Type } from '@thxnetwork/api/types/enums';

const validation = [
    body('title').exists().isString(),
    body('description').exists().isString(),
    body('amount').exists().isInt({ gt: 0 }),
    body('claimAmount').exists().isInt({ gt: 0 }),
    body('erc20Id').exists().isMongoId(),
    body('platform').exists().isNumeric(),
    body('expiryDate').optional().isString(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('pointPrice').optional().isNumeric(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('image').optional().isString(),
    body('isPromoted').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    let image: string | undefined;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc20 = await ERC20Service.getById(req.body.erc20Id);

    // Check if erc20 already is mintable by pool
    if (erc20.type === ERC20Type.Unlimited) {
        const isMinter = await ERC20Service.isMinter(erc20, pool.address);
        if (!isMinter) {
            await ERC20Service.addMinter(erc20, pool.address);
        }
    }

    const { reward, claims } = await createERC20Perk(pool, { ...req.body, image });
    res.status(201).json({ ...reward.toJSON(), claims, erc20 });
};

export default { controller, validation };
