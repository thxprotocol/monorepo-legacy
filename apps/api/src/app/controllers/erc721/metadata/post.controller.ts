import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { createERC721Perk } from '@thxnetwork/api/util/rewards';
import { RewardConditionPlatform, TERC721Perk } from '@thxnetwork/types/index';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import db from '@thxnetwork/api/util/database';

const validation = [param('id').isMongoId(), body('attributes').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']

    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const metadata = await ERC721Service.createMetadata(erc721, req.body.attributes);
    const tokens = metadata.tokens || [];
    const config = {
        uuid: db.createUUID(),
        poolId: String(req.assetPool._id),
        erc721metadataId: String(metadata._id),
        title: '',
        description: '',
        expiryDate: null,
        claimAmount: 1,
        rewardLimit: 1,
        platform: RewardConditionPlatform.None,
        isPromoted: false,
    } as TERC721Perk;
    const { reward, claims } = await createERC721Perk(req.assetPool, config);

    res.status(201).json({ ...metadata.toJSON(), tokens, reward, claims });
};
export default { controller, validation };
