import { Request, Response } from 'express';
import { body, check, query } from 'express-validator';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import ImageService from '@thxnetwork/api/services/ImageService';
import { BadRequestError } from '@thxnetwork/api/util/errors';

const validation = [
    body('name').exists().isString(),
    body('description').exists().isString(),
    body('chainId').exists().isNumeric(),
    body('schema').exists(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    query('forceSync').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC1155']
    let logoImgUrl;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        logoImgUrl = ImageService.getPublicUrl(response.key);
    }
    let properties: any;
    try {
        properties = typeof req.body.schema == 'string' ? JSON.parse(req.body.schema) : req.body.schema;
    } catch (err) {
        throw new BadRequestError('invalid schema');
    }

    if (!Array.isArray(properties)) {
        throw new BadRequestError('schema must be an Array');
    }

    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : false;
    const erc1155 = await ERC1155Service.deploy(
        {
            sub: req.auth.sub,
            chainId: req.body.chainId,
            name: req.body.name,
            description: req.body.description,
            properties,
            archived: false,
            logoImgUrl,
        },
        forceSync,
    );
    res.status(201).json(erc1155);
};

export default { controller, validation };
