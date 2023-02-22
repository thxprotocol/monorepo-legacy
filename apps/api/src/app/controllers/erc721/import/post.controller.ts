import { body } from 'express-validator';
import { Request, Response } from 'express';
import { OwnedNft } from 'alchemy-sdk';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721TokenState, TERC721MetadataProp } from '@thxnetwork/api/types/TERC721';
import { alchemy } from '@thxnetwork/api/util/alchemy';
import { ChainId } from '@thxnetwork/api/types/enums';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import { toChecksumAddress } from 'web3-utils';

const validation = [body('contractAddress').exists(), body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = req.body.contractAddress;
    const nftExists = await ERC721.exists({ sub: req.auth.sub, chainId, address: contractAddress });
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

    const { address, name, symbol } = ownedNfts[0].contract;
    const erc721 = await ERC721.create({
        sub: req.auth.sub,
        chainId,
        address: toChecksumAddress(address, chainId),
        name,
        symbol,
        archived: false,
    });
    const erc721Tokens = [];
    const erc721Properties = [];

    await Promise.all(
        ownedNfts
            .filter((nft) => nft.rawMetadata)
            .map(async ({ rawMetadata, tokenId }) => {
                try {
                    const { attributes, properties } = convertRawMetadataToAttributes(rawMetadata);
                    const metadata = await ERC721Service.createMetadata(erc721, attributes);
                    const erc721Token = await ERC721Token.create({
                        //sub: req.auth.sub,
                        recipient: pool.address,
                        state: ERC721TokenState.Minted,
                        erc721Id: String(erc721._id),
                        metadataId: String(metadata._id),
                        tokenId,
                    });

                    erc721Properties.push(...properties);
                    erc721Tokens.push({ ...erc721Token.toJSON(), metadata: metadata.toJSON() });
                } catch (error) {
                    console.log(error);
                }
            }),
    );

    erc721.properties = Array.from(erc721Properties);
    await erc721.save();

    res.status(201).json({ erc721, erc721Tokens });
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
    const properties: TERC721MetadataProp[] = [];
    const attributes = Object.keys(rawMetadata).map((k) => {
        const valueType = k === 'image' ? k : detectType(rawMetadata[k]);
        const property: TERC721MetadataProp = { name: k, propType: valueType, description: '' };

        properties.push(property);

        return { key: k, value: castToString(rawMetadata[k], valueType) };
    });

    return { properties, attributes };
}

export default { controller, validation };
