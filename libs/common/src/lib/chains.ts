import { arbitrum, mainnet, bsc, polygon, hardhat, Chain } from '@wagmi/core/chains';
import { ChainId } from './types/enums';

type ChainInfo = { name: string; chainId: number; blockExplorer: string; chain: Chain };

const chainList: { [chainId: number]: ChainInfo } = {
    [ChainId.Ethereum]: {
        chainId: ChainId.Ethereum,
        name: 'Ethereum',
        blockExplorer: 'https://etherscan.com',
        chain: mainnet,
    },
    [ChainId.BinanceSmartChain]: {
        chainId: ChainId.BinanceSmartChain,
        name: 'BNB Chain',
        blockExplorer: 'https://bscscan.com',
        chain: bsc,
    },
    [ChainId.Arbitrum]: {
        chainId: ChainId.Arbitrum,
        name: 'Arbitrum',
        blockExplorer: 'https://arbiscan.io',
        chain: arbitrum,
    },
    [ChainId.Polygon]: {
        chainId: ChainId.Polygon,
        name: 'Polygon',
        blockExplorer: 'https://polygonscan.com',
        chain: polygon,
    },
};

if (process.env['NODE_ENV'] !== 'production') {
    chainList[ChainId.Hardhat] = {
        chainId: ChainId.Hardhat,
        name: 'Hardhat',
        blockExplorer: 'https://hardhatscan.com',
        chain: hardhat,
    };
}

function getTokenURL(chainId: ChainId, address: string) {
    return `${chainList[chainId].blockExplorer}/token/${address}`;
}

function getAddressURL(chainId: ChainId, address: string) {
    return `${chainList[chainId].blockExplorer}/address/${address}`;
}

export { chainList, getTokenURL, getAddressURL };
