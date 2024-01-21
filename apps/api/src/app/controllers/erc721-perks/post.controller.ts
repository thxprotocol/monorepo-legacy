import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createERC721Perk } from '@thxnetwork/api/util/rewards';
import { TERC721Perk } from '@thxnetwork/types/interfaces/ERC721Perk';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC1155Document } from '@thxnetwork/api/models/ERC1155';
import { NFTVariant } from '@thxnetwork/types/enums';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { defaults } from '@thxnetwork/api/util/validation';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';
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

type ERC721PerkResponse = ERC721PerkDocument & any;

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['ERC721 Rewards']
    let perks: ERC721PerkResponse[], nft;
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
    pool: AssetPoolDocument,
    nft: ERC721Document | ERC1155Document,
    config: TERC721Perk,
    metadataIdList: string[],
) {
    return await Promise.all(
        metadataIdList.map(async (metadataId: string) => {
            const metadata = await getMetadataForNFTVariant(nft.variant, metadataId);
            if (!metadata) throw new NotFoundError('Could not find the metadata for this ID');

            const { perk, claims } = await createERC721Perk(pool, { ...config, metadataId });
            return { ...perk.toJSON(), nft, claims };
        }),
    );
}

async function createPerkForTokenId(
    pool: AssetPoolDocument,
    nft: ERC721Document | ERC1155Document,
    config: TERC721Perk,
) {
    const token = await getTokenForNFTVariant(nft.variant, config.tokenId);
    if (!token) throw new NotFoundError('Could not find the token for this ID');

    const perk = await ERC721PerkService.create(pool, config);
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
