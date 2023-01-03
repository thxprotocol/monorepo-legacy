import { Request, Response } from 'express';
import { body, check, query } from 'express-validator';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ImageService from '@thxnetwork/api/services/ImageService';
import { BadRequestError } from '@thxnetwork/api/util/errors';

const validation = [
    body('name').exists().isString(),
    body('symbol').exists().isString(),
    body('description').exists().isString(),
    body('chainId').exists().isNumeric(),
    body('schema').exists(),
    query('forceSync').optional().isBoolean(),
    body('logoImgUrl').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721']
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

    const erc721 = await ERC721Service.deploy(
        {
            sub: req.auth.sub,
            chainId: req.body.chainId,
            name: req.body.name,
            symbol: req.body.symbol,
            description: req.body.description,
            properties,
            archived: false,
            logoImgUrl: req.body.logoImgUrl,
        },
        forceSync,
    );

    res.status(201).json(erc721);
};

export default { controller, validation };
