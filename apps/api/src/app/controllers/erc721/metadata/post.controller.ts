import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { agenda, EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL } from '@thxnetwork/api/util/agenda';
import { createERC721Reward } from '../../rewards-utils';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import db from '@thxnetwork/api/util/database';

const validation = [
    param('id').isMongoId(),
    body('title').isString().isLength({ min: 0, max: 100 }),
    body('description').isString().isLength({ min: 0, max: 400 }),
    // TODO Validate the metadata with the schema configured in the collection here
    body('attributes').exists(),
    body('recipient').optional().isEthereumAddress(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']

    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const metadata = await ERC721Service.createMetadata(
        erc721,
        req.body.title,
        req.body.description,
        req.body.attributes,
    );

    const tokens = metadata.tokens || [];

    // Generate a new reward and claims for the metadata
    const { reward, claims } = await createERC721Reward(req.assetPool, {
        _id: '',
        poolId: String(req.assetPool._id),
        erc721metadataId: String(metadata._id),
        claimAmount: '1',
        rewardLimit: 1,
        isClaimOnce: true,
        expiryDate: null,
        title: '',
        description: '',
        uuid: db.createUUID(),
    });

    // Regenerate the metadata QR codes file without sending the notification email
    const poolId = String(req.assetPool._id);
    const sub = req.assetPool.sub;
    const notify = false;
    const fileName = `${req.assetPool._id}_metadata.zip`;

    await agenda.now(EVENT_SEND_DOWNLOAD_METADATA_QR_EMAIL, {
        poolId,
        sub,
        fileName,
        notify,
    });

    res.status(201).json({ ...metadata.toJSON(), tokens, reward, claims });
};
export default { controller, validation };
