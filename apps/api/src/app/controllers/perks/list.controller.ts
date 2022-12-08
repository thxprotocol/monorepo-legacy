import { Request, Response } from 'express';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const erc20Perks = await ERC20Perk.find({ poolId: req.assetPool._id });
    const erc721Perks = await ERC721Perk.find({ poolId: req.assetPool._id });

    res.json({
        erc20Perks: erc20Perks.map((r) => {
            return {
                _id: r._id,
                uuid: r.uuid,
                title: r.title,
                description: r.description,
                amount: r.amount,
                pointPrice: r.pointPrice,
                image: r.image,
            };
        }),
        erc721Perks: erc721Perks.map((r) => {
            return {
                _id: r._id,
                uuid: r.uuid,
                title: r.title,
                description: r.description,
                erc721metadataId: r.erc721metadataId,
                pointPrice: r.pointPrice,
                image: r.image,
            };
        }),
    });
};

export default { controller };
