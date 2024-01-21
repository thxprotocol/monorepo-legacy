import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import ImageService from '@thxnetwork/api/services/ImageService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import CreateController from './post.controller';

const validation = [param('id').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let perk = await ERC721PerkService.get(req.params.id);
    if (!perk) throw new NotFoundError('Could not find the perk');

    const image = req.file && (await ImageService.upload(req.file));
    const metadataIdList = req.body.metadataIds ? JSON.parse(req.body.metadataIds) : [];
    const config = {
        ...req.body,
        poolId: req.header('X-PoolId'),
        image,
        metadataId: metadataIdList.length ? metadataIdList[0] : '',
    };
    perk = await ERC721PerkService.update(perk, config);

    return res.json(perk);
};

export default { controller, validation };
