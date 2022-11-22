import { ChainInfo } from '@thxnetwork/dashboard/types/ChainInfo';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';

const chainInfo: { [chainId: number]: ChainInfo } = {
    1: {
        disabled: true,
        chainId: ChainId.Ethereum,
        name: 'Ethereum',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_ethereum.svg'),
        blockExplorer: 'https://mumbai.polygonscan.com',
    },
    42161: {
        disabled: true,
        chainId: ChainId.Arbitrum,
        name: 'Arbitrum',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_arbitrum.svg'),
        blockExplorer: 'https://mumbai.polygonscan.com',
    },
    56: {
        disabled: true,
        chainId: ChainId.BinanceSmartChain,
        name: 'Binance Smart Chain',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_bsc.svg'),
        blockExplorer: 'https://mumbai.polygonscan.com',
    },
    80001: {
        disabled: false,
        chainId: ChainId.PolygonMumbai,
        name: 'Polygon Mumbai',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_polygon.svg'),
        blockExplorer: 'https://mumbai.polygonscan.com',
    },
    137: {
        disabled: false,
        chainId: ChainId.Polygon,
        name: 'Polygon',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_polygon.svg'),
        blockExplorer: 'https://polygonscan.com',
    },
};

if (process.env.NODE_ENV !== 'production') {
    chainInfo[ChainId.Hardhat] = {
        disabled: false,
        chainId: ChainId.Hardhat,
        name: 'Hardhat',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_hardhat.svg'),
        blockExplorer: 'https://hardhatscan.com',
    };
}

export { chainInfo };
