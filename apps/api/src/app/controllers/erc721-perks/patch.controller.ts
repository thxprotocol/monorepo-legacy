import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
import ImageService from '@thxnetwork/api/services/ImageService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { check, param } from 'express-validator';

const validation = [
    param('id').exists(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let reward = await ERC721PerkService.get(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    let image: string | undefined;
    if (req.file) {
        const response = await ImageService.upload(req.file);
        image = ImageService.getPublicUrl(response.key);
    }
    reward = await ERC721PerkService.update(reward, { ...req.body, image });
    return res.json(reward);
};

export default { controller, validation };
