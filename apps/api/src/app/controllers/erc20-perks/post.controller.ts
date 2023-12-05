import { Request, Response } from 'express';
import { body, check } from 'express-validator';
import { ERC20Type } from '@thxnetwork/types/enums';
import ERC20PerkService from '@thxnetwork/api/services/ERC20PerkService';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';

const validation = [
    body('title').exists().isString(),
    body('description').exists().isString(),
    body('amount').exists().isInt({ gt: 0 }),
    body('erc20Id').exists().isMongoId(),
    body('expiryDate').optional().isISO8601(),
    body('pointPrice').optional().isNumeric(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('image').optional().isString(),
    body('isPromoted').optional().isBoolean(),
    body('tokenGatingContractAddress').optional().isString(),
    body('tokenGatingVariant').optional().isString(),
    body('tokenGatingAmount').optional().isInt(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const image = req.file && (await ImageService.upload(req.file));
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc20 = await ERC20Service.getById(req.body.erc20Id);

    // Check if erc20 already is mintable by pool
    if (erc20.type === ERC20Type.Unlimited) {
        const isMinter = await ERC20Service.isMinter(erc20, pool.address);
        if (!isMinter) {
            await ERC20Service.addMinter(erc20, pool.address);
        }
    }

    const perk = await ERC20PerkService.create(pool, { ...req.body, image });

    res.status(201).json({ ...perk.toJSON(), erc20 });
};

export default { controller, validation };
