import { Network, Alchemy } from 'alchemy-sdk';
import { ALCHEMY_API_KEY } from '../config/secrets';
import { ChainId } from '../types/enums';

export function getAlchemy(chainId: ChainId) {
    const settings = {
        apiKey: ALCHEMY_API_KEY,
        network: getNetwork(chainId),
    };
    console.log('ALCHEMY SETTINGS', settings);
    return new Alchemy(settings);
}

export function getNetwork(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Hardhat:
        case ChainId.PolygonMumbai:
            return Network.MATIC_MUMBAI;
        case ChainId.Polygon:
            return Network.MATIC_MAINNET;
    }
}

export const nockResponse = {
    ownedNfts: [
        {
            contract: {
                address: '0x14ddb079c64f82501e98557d18defa12c5fc69fa',
                name: 'TEST NFT COLLECTION',
                symbol: 'NFTCTEST',
                totalSupply: '4',
                tokenType: 'ERC721',
                openSea: {
                    floorPrice: undefined,
                    collectionName: undefined,
                    safelistRequestStatus: undefined,
                    imageUrl: undefined,
                    description: undefined,
                    externalUrl: undefined,
                    twitterUsername: undefined,
                    discordUrl: undefined,
                    lastIngestedAt: '2023-02-02T11:52:00.000Z',
                },
                contractDeployer: '0x5e895a486ea6a67e8c428bb6da0eaffc801c1781',
                deployedBlockNumber: 31658006,
            },
            id: {
                tokenId: '1',
                tokenMetadata: {
                    tokenType: 'ERC721',
                },
            },
            tokenId: '1',
            tokenType: 'ERC721',
            title: '#1',
            description: 'image description piece #1',
            timeLastUpdated: '2023-02-02T13:40:51.183Z',
            metadataError: undefined,
            rawMetadata: {
                name: '#1',
                description: 'image description piece #1',
                image: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/1.png',
            },
            tokenUri: {
                raw: 'https://gateway.pinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/1.json',
                gateway: 'https://alchemy.mypinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/1.json',
            },
            media: [
                {
                    raw: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/1.png',
                    gateway: 'https://nft-cdn.alchemy.com/matic-mumbai/59e443c4512b72533afedef0083cb288',
                    thumbnail:
                        'https://res.cloudinary.com/alchemyapi/image/upload/thumbnail/matic-mumbai/59e443c4512b72533afedef0083cb288',
                    format: 'png',
                    bytes: 6107,
                },
            ],
            spamInfo: undefined,
            balance: 1,
        },
        {
            contract: {
                address: '0x14ddb079c64f82501e98557d18defa12c5fc69fa',
                name: 'TEST NFT COLLECTION',
                symbol: 'NFTCTEST',
                totalSupply: '4',
                tokenType: 'ERC721',
                openSea: {
                    floorPrice: undefined,
                    collectionName: undefined,
                    safelistRequestStatus: undefined,
                    imageUrl: undefined,
                    description: undefined,
                    externalUrl: undefined,
                    twitterUsername: undefined,
                    discordUrl: undefined,
                    lastIngestedAt: '2023-02-02T11:52:00.000Z',
                },
                contractDeployer: '0x5e895a486ea6a67e8c428bb6da0eaffc801c1781',
                deployedBlockNumber: 31658006,
            },
            id: {
                tokenId: '2',
                tokenMetadata: {
                    tokenType: 'ERC721',
                },
            },
            tokenId: '2',
            tokenType: 'ERC721',
            title: '#2',
            description: 'image description piece #2',
            timeLastUpdated: '2023-02-02T11:51:21.920Z',
            metadataError: undefined,
            rawMetadata: {
                name: '#2',
                description: 'image description piece #2',
                image: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/2.jpeg',
            },
            tokenUri: {
                raw: 'https://gateway.pinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/2.json',
                gateway: 'https://alchemy.mypinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/2.json',
            },
            media: [
                {
                    raw: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/2.jpeg',
                    gateway: 'https://nft-cdn.alchemy.com/matic-mumbai/d6c469dd3435968727e6b448141e05ae',
                    thumbnail:
                        'https://res.cloudinary.com/alchemyapi/image/upload/thumbnail/matic-mumbai/d6c469dd3435968727e6b448141e05ae',
                    format: 'jpeg',
                    bytes: 5338,
                },
            ],
            spamInfo: undefined,
            balance: 1,
        },
        {
            contract: {
                address: '0x14ddb079c64f82501e98557d18defa12c5fc69fa',
                name: 'TEST NFT COLLECTION',
                symbol: 'NFTCTEST',
                totalSupply: '4',
                tokenType: 'ERC721',
                openSea: {
                    floorPrice: undefined,
                    collectionName: undefined,
                    safelistRequestStatus: undefined,
                    imageUrl: undefined,
                    description: undefined,
                    externalUrl: undefined,
                    twitterUsername: undefined,
                    discordUrl: undefined,
                    lastIngestedAt: '2023-02-02T11:52:00.000Z',
                },
                contractDeployer: '0x5e895a486ea6a67e8c428bb6da0eaffc801c1781',
                deployedBlockNumber: 31658006,
            },
            id: {
                tokenId: '3',
                tokenMetadata: {
                    tokenType: 'ERC721',
                },
            },
            tokenId: '3',
            tokenType: 'ERC721',
            title: '#3',
            description: 'image description piece #3',
            timeLastUpdated: '2023-02-02T11:51:21.901Z',
            metadataError: undefined,
            rawMetadata: {
                name: '#3',
                description: 'image description piece #3',
                image: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/3.jpeg',
            },
            tokenUri: {
                raw: 'https://gateway.pinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/3.json',
                gateway: 'https://alchemy.mypinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/3.json',
            },
            media: [
                {
                    raw: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/3.jpeg',
                    gateway: 'https://nft-cdn.alchemy.com/matic-mumbai/fe790afb272f4a70032449b74f7be1c4',
                    thumbnail:
                        'https://res.cloudinary.com/alchemyapi/image/upload/thumbnail/matic-mumbai/fe790afb272f4a70032449b74f7be1c4',
                    format: 'jpeg',
                    bytes: 7204,
                },
            ],
            spamInfo: undefined,
            balance: 1,
        },
        {
            contract: {
                address: '0x14ddb079c64f82501e98557d18defa12c5fc69fa',
                name: 'TEST NFT COLLECTION',
                symbol: 'NFTCTEST',
                totalSupply: '4',
                tokenType: 'ERC721',
                openSea: {
                    floorPrice: undefined,
                    collectionName: undefined,
                    safelistRequestStatus: undefined,
                    imageUrl: undefined,
                    description: undefined,
                    externalUrl: undefined,
                    twitterUsername: undefined,
                    discordUrl: undefined,
                    lastIngestedAt: '2023-02-02T11:52:00.000Z',
                },
                contractDeployer: '0x5e895a486ea6a67e8c428bb6da0eaffc801c1781',
                deployedBlockNumber: 31658006,
            },
            id: {
                tokenId: '4',
                tokenMetadata: {
                    tokenType: 'ERC721',
                },
            },
            tokenId: '4',
            tokenType: 'ERC721',
            title: '#4',
            description: 'image description piece #4',
            timeLastUpdated: '2023-02-02T11:51:21.982Z',
            metadataError: undefined,
            rawMetadata: {
                name: '#4',
                description: 'image description piece #4',
                image: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/4.jpeg',
            },
            tokenUri: {
                raw: 'https://gateway.pinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/4.json',
                gateway: 'https://alchemy.mypinata.cloud/ipfs/QmUGShzzKuNNhS7XeEuJV6UnLvTBLH9zbojzqcTjyHDGw8/4.json',
            },
            media: [
                {
                    raw: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/4.jpeg',
                    gateway: 'https://nft-cdn.alchemy.com/matic-mumbai/37b00152719bd7d92bad6340edae43cf',
                    thumbnail:
                        'https://res.cloudinary.com/alchemyapi/image/upload/thumbnail/matic-mumbai/37b00152719bd7d92bad6340edae43cf',
                    format: 'jpeg',
                    bytes: 5709,
                },
            ],
            spamInfo: undefined,
            balance: 1,
        },
    ],
    pageKey: undefined,
    totalCount: 4,
};
