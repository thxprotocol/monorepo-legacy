import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { OwnedNft } from 'alchemy-sdk';
import util from 'util';
import { ERC721Token } from '@thxnetwork/api/models/ERC721Token';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC721TokenState, TERC721Metadata, TERC721MetadataProp, TERC721Token } from '@thxnetwork/api/types/TERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { getAlchemy } from '@thxnetwork/api/util/alchemy';
import PoolService from '@thxnetwork/api/services/PoolService';
import { logger } from '@thxnetwork/api/util/logger';

const validation = [param('address').exists(), body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const contractAddress = req.params.address;
    const sub = req.auth.sub;
    const chainId = Number(req.body.chainId);

    let ownerAddress: string;
    const account = await AccountProxy.getById(sub);
    ownerAddress = account.address;

    if (!ownerAddress) {
        const wallet = await WalletService.findOneByQuery({ sub, chainId });
        if (!wallet) {
            throw new NotFoundError('Could not find the account address');
        }
        ownerAddress = wallet.address;
    }

    // check if the contract is already imported
    let erc721 = await ERC721.findOne({ sub, chainId, address: contractAddress });
    if (erc721) {
        throw new BadRequestError('This contract is already present, and can not be imported');
    }

    const alchemy = getAlchemy(chainId);

    let pageKey: string | undefined = '1';
    const ownedNfts: OwnedNft[] = [];

    while (pageKey) {
        try {
            const result = await alchemy.nft.getNftsForOwner(ownerAddress, {
                contractAddresses: [contractAddress],
                omitMetadata: false,
                pageKey: pageKey,
            });
            console.log('RESULTS', util.inspect(result, false, 10));
            ownedNfts.push(...result.ownedNfts);

            pageKey = result.pageKey;
            console.log('pageKey', pageKey);
        } catch (err) {
            logger.error('error on getNftsForOwner:', err);
            throw new Error('Could not retrieve NFT tokens for this contract address');
        }
    }

    if (!ownedNfts.length) {
        throw new NotFoundError('Could not find NFT tokens for this contract address');
    }

    const nftOwned = ownedNfts[0]; // for each token the info about the NFT contract are repeated

    erc721 = await ERC721.create({
        sub,
        chainId,
        address: nftOwned.contract.address,
        name: nftOwned.contract.name,
        symbol: nftOwned.contract.symbol,
    });

    const pool = await PoolService.getById(req.header('X-PoolId'));
    const recipient = pool.address; // will be the owner of the imported tokens

    const erc721Tokens: (TERC721Token & { metadata: TERC721Metadata })[] = [];

    const erc721Properties = new Set<TERC721MetadataProp>();

    const promises = ownedNfts
        .filter((nft) => nft.rawMetadata != undefined)
        .map(async (x) => {
            const mappedMetadata = Object.keys(x.rawMetadata).map((k) => {
                const metadataValue = x.rawMetadata[k];

                // build the property set for the ERC721 object
                const valueType = k === 'image' ? k : detectType(metadataValue);
                const property = { name: k, propType: valueType, description: '' } as TERC721MetadataProp;
                erc721Properties.add(property);

                return {
                    key: k,
                    value: castToString(metadataValue, valueType),
                };
            });

            const metadata = await ERC721Service.createMetadata(erc721, mappedMetadata);
            const erc721Token = await ERC721Token.create({
                sub,
                recipient,
                state: ERC721TokenState.Minted,
                erc721Id: String(erc721._id),
                tokenId: x.tokenId,
                metadataId: String(metadata._id),
            });
            erc721Tokens.push({ ...erc721Token.toJSON(), metadata: metadata.toJSON() });
        });
    await Promise.all(promises);

    erc721.properties = Array.from(erc721Properties);

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

export default { controller, validation };
