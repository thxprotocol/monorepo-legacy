import { Request, Response } from 'express';
import { ERC20Perk, ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc20Perks = await ERC20Perk.find({ poolId: pool._id });
    const erc721Perks = await ERC721Perk.find({ poolId: pool._id });

    res.json({
        erc20Perks: erc20Perks
            .filter((p: ERC20PerkDocument) => p.pointPrice > 0)
            .map((r) => {
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
            erc721Perks
                .filter((p: ERC721PerkDocument) => p.pointPrice > 0)
                .map(async (r) => {
                    return {
                        _id: r._id,
                        uuid: r.uuid,
                        title: r.title,
                        description: r.description,
                        erc721: await ERC721Service.findById(r.erc721Id),
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
