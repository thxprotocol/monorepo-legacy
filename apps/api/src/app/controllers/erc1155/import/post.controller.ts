import { body } from 'express-validator';
import { Request, Response } from 'express';
import { OwnedNft } from 'alchemy-sdk';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155TokenState, TERC1155MetadataProp } from '@thxnetwork/api/types/TERC1155';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { ChainId } from '@thxnetwork/api/types/enums';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    body('contractAddress').exists(),
    body('chainId').exists().isNumeric(),
    body('name').exists().isString(),
];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = req.body.contractAddress;
    const nftExists = await ERC1155.exists({ sub: req.auth.sub, chainId, address: contractAddress });
    if (nftExists) throw new BadRequestError('This contract is already present, and can not be imported');

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const pageSize = 100;

    let pageKey = 0,
        pageCount = 1,
        ownedNfts: OwnedNft[] = [];

    while (pageKey < pageCount) {
        try {
            const key = String(++pageKey);
            const result = await alchemy.nft.getNftsForOwner(pool.address, {
                contractAddresses: [contractAddress],
                omitMetadata: false,
                pageSize,
                pageKey: key,
            });
            const totalCount = Number(result.totalCount);

            // If total is less than size there will only be 1 page, if not round up total / size
            // to get the max amount of pages
            pageCount = totalCount < pageSize ? 1 : Math.ceil(totalCount / pageSize);

            ownedNfts = ownedNfts.concat(result.ownedNfts);
        } catch (error) {
            console.log(error);
        }
    }

    if (!ownedNfts.length) {
        throw new NotFoundError('Could not find NFT tokens for this contract address');
    }

    const { address } = ownedNfts[0].contract;
    const erc1155 = await ERC1155.create({
        sub: req.auth.sub,
        chainId,
        address,
        name: req.body.name,
    });
    const erc1155Tokens = [];
    const erc1155Properties = [];

    await Promise.all(
        ownedNfts
            .filter((nft) => nft.rawMetadata)
            .map(async ({ rawMetadata, tokenId }) => {
                try {
                    const { attributes, properties } = convertRawMetadataToAttributes(rawMetadata);
                    const metadata = await ERC1155Service.createMetadata(erc1155, attributes);
                    const erc1155Token = await ERC1155Token.create({
                        sub: req.auth.sub,
                        recipient: pool.address,
                        state: ERC1155TokenState.Minted,
                        erc1155Id: String(erc1155._id),
                        metadataId: String(metadata._id),
                        tokenId,
                    });

                    erc1155Properties.push(...properties);
                    erc1155Tokens.push({ ...erc1155Token.toJSON(), metadata: metadata.toJSON() });
                } catch (error) {
                    console.log(error);
                }
            }),
    );

    erc1155.properties = Array.from(erc1155Properties);
    await erc1155.save();

    res.status(201).json({ erc1155, erc1155Tokens });
};

function detectType(value: any) {
    if (Array.isArray(value)) {
        return 'array';
    }
    switch (typeof value) {
        case 'string':
            return isValidUrl(value) ? 'link' : 'string';
        case 'number':
            return 'number';
        case 'object':
            return 'json';
        default:
            return 'other';
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

function castToString(value: any, valueType: string) {
    switch (valueType) {
        case 'object': {
            try {
                return JSON.parse(value);
            } catch (e) {
                return '';
            }
        }
        case 'string':
            return value;
        default:
            return value.toString();
    }
}

function convertRawMetadataToAttributes(rawMetadata: any) {
    const properties: TERC1155MetadataProp[] = [];
    const attributes = Object.keys(rawMetadata).map((k) => {
        const valueType = k === 'image' ? k : detectType(rawMetadata[k]);
        const property: TERC1155MetadataProp = { name: k, propType: valueType, description: '' };

        properties.push(property);

        return { key: k, value: castToString(rawMetadata[k], valueType) };
    });

    return { properties, attributes };
}

export default { controller, validation };
