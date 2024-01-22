import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { IPFS_BASE_URL, NODE_ENV } from '@thxnetwork/api/config/secrets';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import IPFSService from '@thxnetwork/api/services/IPFSService';

const validation = [
    param('id').isMongoId(),
    body('name').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('description').optional().isString(),
    body('externalUrl').optional().isURL(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    let image = req.body.imageUrl;
    if (req.body.imageUrl && NODE_ENV === 'production') {
        const cid = await IPFSService.addUrlSource(req.body.imageUrl);
        image = IPFS_BASE_URL + cid;
    }

    const metadata = await ERC721Metadata.create({
        erc721Id: String(erc721._id),
        name: req.body.name,
        image,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        externalUrl: req.body.externalUrl,
    });

    res.status(201).json(metadata);
};
export default { controller, validation };
