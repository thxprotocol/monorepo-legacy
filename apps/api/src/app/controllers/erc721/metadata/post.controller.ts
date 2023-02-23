import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { TERC721Attribute } from '@thxnetwork/api/types/TERC721';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';

export function getValue(attributes: TERC721Attribute[], key: string) {
    const attr = attributes.find((attr: TERC721Attribute) => attr.key === key);
    return attr ? attr.value : '';
}

const validation = [param('id').isMongoId(), body('attributes').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find this NFT in the database');

    const metadata = await ERC721Metadata.create({
        erc721Id: String(erc721._id),
        imgUrl: getValue(req.body.attributes, 'image'),
        name: getValue(req.body.attributes, 'name'),
        image: getValue(req.body.attributes, 'image'),
        description: getValue(req.body.attributes, 'description'),
        externalUrl: getValue(req.body.attributes, 'externalUrl'),
    });

    res.status(201).json(metadata);
};
export default { controller, validation };
