import { Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import {
    Claim,
    ClaimDocument,
    RewardNFT,
    RewardNFTDocument,
    ERC721Metadata,
    ERC721MetadataDocument,
    ERC721Document,
    PoolDocument,
} from '@thxnetwork/api/models';

const validation = [
    param('uuid')
        .exists()
        .isString()
        .custom((uuid: string) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(uuid);
        }),
];

const controller = async (req: Request, res: Response) => {
    let claim: ClaimDocument,
        pool: PoolDocument,
        perk: RewardNFTDocument,
        erc721: ERC721Document,
        metadata: ERC721MetadataDocument;

    try {
        claim = await Claim.findOne({ uuid: req.params.uuid });
        if (!claim) throw new NotFoundError('Could not find this claim URL');

        pool = await PoolService.getById(claim.poolId);
        if (!pool) throw new NotFoundError('Could not find campaign for this claim URL');

        perk = await RewardNFT.findOne({ uuid: claim.rewardUuid });
        if (!perk) throw new NotFoundError('Could not find configuration for this claim URL');

        erc721 = await ERC721Service.findById(claim.erc721Id);
        if (!erc721) throw new NotFoundError('Could not find NFT for this claim URL');

        metadata = await ERC721Metadata.findById(perk.metadataId);
        if (!metadata) throw new NotFoundError('Could not find metadata for this claim URL');

        // Can not be claimed when sub is set for this claim URL
        if (claim.sub) throw new ForbiddenError('This NFT is claimed already.');

        return res.json({ claim, pool, perk, erc721, metadata });
    } catch (error) {
        return res.json({ ...Object.assign({ claim }, { error: error.message }), pool, perk, erc721, metadata });
    }
};

export default { controller, validation };
