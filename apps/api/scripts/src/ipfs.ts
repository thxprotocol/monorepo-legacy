import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import pinataSDK from '@pinata/sdk';
import axios from 'axios';

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_API_JWT });

class PinataIPFS {
    static async addURL(url: string) {
        const response = await axios.get(url, { responseType: 'stream' });
        const urlParts = url.split('/');
        const name = urlParts[urlParts.length - 1];
        const { IpfsHash } = await pinata.pinFileToIPFS(response.data, {
            pinataMetadata: { name },
            pinataOptions: { cidVersion: 0 },
        });
        return IpfsHash;
    }
}

export default async function main() {
    const nft = await ERC721.findById('64c8f15e01506efa24c1c72c');
    const metadataList = await ERC721Metadata.find({ erc721Id: nft._id });
    for (const metadata of metadataList) {
        const imgCid = await PinataIPFS.addURL(metadata.imageUrl);
        const metadataCid = await PinataIPFS.addURL('https://api.thx.network/v1/metadata/' + String(metadata._id));
        console.log(metadata.name, String(metadata._id), imgCid, metadataCid);
    }
}
