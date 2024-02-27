import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ERC20Type } from '@thxnetwork/common/enums';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import SafeService from '@thxnetwork/api/services/SafeService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { defaults } from '@thxnetwork/api/util/validation';

const validation = [
    ...defaults.reward,
    body('erc20Id').optional().isMongoId(),
    body('amount').optional().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Could not find campaign Safe');

    const erc20 = await ERC20Service.getById(req.body.erc20Id);
    if (!safe) throw new NotFoundError('Could not find ERC20');

    const image = req.file && (await ImageService.upload(req.file));

    // Check if erc20 already is mintable by pool safe
    if (erc20.type === ERC20Type.Unlimited) {
        const isMinter = await ERC20Service.isMinter(erc20, safe.address);
        if (!isMinter) await ERC20Service.addMinter(erc20, safe.address);
    }

    const perk = await RewardCoinService.create(pool, { ...req.body, image });

    res.status(201).json({ ...perk.toJSON(), erc20 });
};

export default { controller, validation };
