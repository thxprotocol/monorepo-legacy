import { Request, Response } from 'express';
import { body, check, query } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ImageService from '@thxnetwork/api/services/ImageService';

export const validation = [
    body('name').exists().isString(),
    body('symbol').exists().isString(),
    body('chainId').exists().isNumeric(),
    body('type').exists().isNumeric(),
    body('totalSupply').optional().isNumeric(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    query('forceSync').optional().isBoolean(),
];

export const controller = async (req: Request, res: Response) => {
    const logoImgUrl = req.file && (await ImageService.upload(req.file));
    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : false;

    const erc20 = await ERC20Service.deploy(
        {
            name: req.body.name,
            symbol: req.body.symbol,
            chainId: req.body.chainId,
            totalSupply: req.body.totalSupply,
            type: req.body.type,
            sub: req.auth.sub,
            logoImgUrl,
        },
        forceSync,
    );

    res.status(201).json(erc20);
};
export default { controller, validation };
