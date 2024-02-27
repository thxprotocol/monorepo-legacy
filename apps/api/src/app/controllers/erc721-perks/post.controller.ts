import { body } from 'express-validator';
import { Request, Response } from 'express';
import { NFTVariant } from '@thxnetwork/common/enums';
import { defaults } from '@thxnetwork/api/util/validation';
import { createRewardNFT } from '@thxnetwork/api/util/rewards';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import {
    ERC1155Document,
    ERC721Document,
    ERC721Metadata,
    ERC721Token,
    PoolDocument,
    RewardNFTDocument,
} from '@thxnetwork/api/models';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import RewardNFTService from '@thxnetwork/api/services/RewardNFTService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [
    ...defaults.reward,
    body('erc721Id').optional().isString(),
    body('erc1155Id').optional().isString(),
    body('metadataIds').optional().isString(),
    body('tokenId').optional().isString(),
    body('claimLimit').optional().isInt(),
    body('claimAmount').optional().isInt({ lt: 5001 }),
    body('redirectUrl').optional().isURL({ require_tld: false }),
];

type RewardNFTResponse = RewardNFTDocument & any;

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Rewards']
    let perks: RewardNFTResponse[], nft;
    const { metadataIds, tokenId, erc721Id, erc1155Id } = req.body;

    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Could not find campaign Safe');

    const metadataIdList = metadataIds ? JSON.parse(metadataIds) : [];

    // Handle erc721 variant
    if (erc721Id) {
        nft = await ERC721Service.findById(erc721Id);
        if (!nft) throw new NotFoundError('Could not find erc721');

        // Check if Safe can mint
        if (metadataIdList.length) {
            const isMinter = await ERC721Service.isMinter(nft, safe.address);
            // TODO this might fail if the contract is external
            if (!isMinter) await ERC721Service.addMinter(nft, safe.address);
        }
    }

    // Handle erc1155 variant
    if (erc1155Id) {
        nft = await ERC1155Service.findById(erc1155Id);
        if (!nft) throw new NotFoundError('Could not find erc1155');

        // Check if Safe can mint
        if (metadataIdList.length) {
            const isMinter = await ERC721Service.isMinter(nft, safe.address);
            // TODO this might fail if the contract is external
            if (!isMinter) await ERC721Service.addMinter(nft, safe.address);
        }
    }

    // Handle uploaded image file
    const image = req.file && (await ImageService.upload(req.file));

    // Create perks for provided metadataIds
    if (metadataIdList.length) {
        // Create a perk for every metadatId provided.
        const config = { ...req.body, image, poolId: String(pool._id) };
        perks = await createPerksForMetadataIdList(pool, nft, config, metadataIdList);
    }

    // Create perks for provided tokenId
    if (tokenId) {
        // Create a perk for the tokenId
        const config = { ...req.body, image, poolId: String(pool._id) };
        perks = await createPerkForTokenId(pool, nft, config);
    }

    res.status(201).json(perks);
};

async function createPerksForMetadataIdList(
    pool: PoolDocument,
    nft: ERC721Document | ERC1155Document,
    config: TRewardNFT,
    metadataIdList: string[],
) {
    return await Promise.all(
        metadataIdList.map(async (metadataId: string) => {
            const metadata = await getMetadataForNFTVariant(nft.variant, metadataId);
            if (!metadata) throw new NotFoundError('Could not find the metadata for this ID');

            const { perk, claims } = await createRewardNFT(pool, { ...config, metadataId });
            return { ...perk.toJSON(), nft, claims };
        }),
    );
}

async function createPerkForTokenId(pool: PoolDocument, nft: ERC721Document | ERC1155Document, config: TRewardNFT) {
    const token = await getTokenForNFTVariant(nft.variant, config.tokenId);
    if (!token) throw new NotFoundError('Could not find the token for this ID');

    const perk = await RewardNFTService.create(pool, config);
    return [{ ...perk.toJSON(), nft }];
}

async function getMetadataForNFTVariant(variant: NFTVariant, metadataId: string) {
    switch (variant) {
        case NFTVariant.ERC721:
            return await ERC721Metadata.findById(metadataId);
        case NFTVariant.ERC1155:
            return await ERC1155Service.findMetadataById(metadataId);
    }
}

async function getTokenForNFTVariant(variant: NFTVariant, tokenId: string) {
    switch (variant) {
        case NFTVariant.ERC721:
            return await ERC721Token.findById(tokenId);
        case NFTVariant.ERC1155:
            return await ERC1155Service.findTokenById(tokenId);
    }
}

export default { controller, validation };
