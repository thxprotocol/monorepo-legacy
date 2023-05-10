import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import { ERC1155Metadata } from '@thxnetwork/api/models/ERC1155Metadata';
import { IPFS_BASE_URL } from '@thxnetwork/api/config/secrets';
import IPFSService from '@thxnetwork/api/services/IPFSService';
import { AccountPlanType } from '@thxnetwork/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [
    param('id').isMongoId(),
    body('name').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('description').optional().isString(),
    body('externalUrl').optional().isURL(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']
    const erc1155 = await ERC1155Service.findById(req.params.id);
    if (!erc1155) throw new NotFoundError('Could not find this NFT in the database');

    const account = await AccountProxy.getById(req.auth.sub);
    let image = req.body.imageUrl;

    if (req.body.imageUrl && account.plan === AccountPlanType.Premium) {
        const result = await IPFSService.addImageUrl(req.body.imageUrl);
        image = IPFS_BASE_URL + result.cid.toString();
    }

    const erc1155Id = String(erc1155._id);
    const count = await ERC1155Metadata.count({ erc1155Id });
    const tokenId = count + 1;
    const metadata = await ERC1155Metadata.create({
        erc1155Id,
        name: req.body.name,
        image,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        externalUrl: req.body.externalUrl,
        tokenId,
    });

    res.status(201).json(metadata);
};
export default { controller, validation };
