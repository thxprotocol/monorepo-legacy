import { Request, Response } from 'express';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

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
                isOwned: false,
                isPromoted: r.isPromoted,
            };
        }),
        erc721Perks: await Promise.all(
            erc721Perks.map(async (r) => {
                return {
                    _id: r._id,
                    uuid: r.uuid,
                    title: r.title,
                    description: r.description,
                    erc721metadataId: r.erc721metadataId,
                    metadata: await ERC721Service.findMetadataById(r.erc721metadataId),
                    pointPrice: r.pointPrice,
                    image: r.image,
                    isOwned: false,
                    isPromoted: r.isPromoted,
                };
            }),
        ),
    });
};

export default { controller };
