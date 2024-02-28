import { API_URL, NODE_ENV } from '../config/secrets';
import { NFTVariant } from '@thxnetwork/common/enums';
import { ERC721Document, ERC1155Document } from '@thxnetwork/api/models';
import axios from 'axios';
import pinataSDK from '@pinata/sdk';
import https from 'https';

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_API_JWT });

if (NODE_ENV !== 'production') {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
    axios.defaults.httpsAgent = httpsAgent;
}

export async function addUrlSource(url: string) {
    const response = await axios.get(url, { responseType: 'stream' });
    const urlParts = url.split('/');
    const name = urlParts[urlParts.length - 1];
    const { IpfsHash } = await pinata.pinFileToIPFS(response.data, {
        pinataMetadata: { name },
        pinataOptions: { cidVersion: 0 },
    });
    return IpfsHash;
}

async function getTokenURI(nft: ERC721Document | ERC1155Document, metadataId: string, tokenId?: string) {
    const tokenUri = {
        [NFTVariant.ERC721]: metadataId,
        [NFTVariant.ERC1155]: tokenId,
    };
    // During tests we can not grab data from an url due to TLS issues, hence we return the internally used tokenUri
    if (NODE_ENV === 'test') return tokenUri[nft.variant];

    const metadataUrl = {
        [NFTVariant.ERC721]: `${API_URL}/v1/metadata/${metadataId}`,
        [NFTVariant.ERC1155]: `${API_URL}/v1/metadata/erc1155/${nft._id}/${tokenId}`,
    };

    return await addUrlSource(metadataUrl[nft.variant]);
}

export default { addUrlSource, getTokenURI };
