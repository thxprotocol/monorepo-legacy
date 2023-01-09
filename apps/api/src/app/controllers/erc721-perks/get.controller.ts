import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const reward = await ERC721PerkService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByReward(reward);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc721 = await ERC721Service.findById(req.params.id);

    res.json({ ...reward.toJSON(), erc721, claims, poolAddress: pool.address });
};

export default { controller, validation };
