import { Request, Response } from 'express';
import { body, check, query } from 'express-validator';
import { NFTVariant } from '@thxnetwork/common/enums';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import ImageService from '@thxnetwork/api/services/ImageService';

const validation = [
    body('name').exists().isString(),
    body('description').exists().isString(),
    body('chainId').exists().isNumeric(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    query('forceSync').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']
    const logoImgUrl = req.file && (await ImageService.upload(req.file));
    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : false;
    const erc1155 = await ERC1155Service.deploy(
        {
            variant: NFTVariant.ERC1155,
            sub: req.auth.sub,
            chainId: req.body.chainId,
            name: req.body.name,
            description: req.body.description,
            logoImgUrl,
        },
        forceSync,
    );
    res.status(201).json(erc1155);
};

export default { controller, validation };
