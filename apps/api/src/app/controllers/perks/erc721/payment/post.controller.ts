import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('uuid').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Perks Payment']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc721Perk = await ERC721Perk.findOne({ uuid: req.params.uuid });
    if (!erc721Perk) throw new NotFoundError('Could not find this perk');

    // start payment intent creation

    res.status(201).end();
};

export default { controller, validation };
