import { ChainInfo } from '@thxnetwork/wallet/types/ChainInfo';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';

const chainInfo: { [chainId: number]: ChainInfo } = {
  1: {
    disabled: true,
    chainId: ChainId.Ethereum,
    name: 'Ethereum',
    logo: require('@thxnetwork/wallet/../public/assets/thx_logo_ethereum.svg'),
    blockExplorer: 'https://mumbai.polygonscan.com',
    relayer: '',
  },
  42161: {
    disabled: true,
    chainId: ChainId.Arbitrum,
    name: 'Arbitrum',
    logo: require('@thxnetwork/wallet/../public/assets/thx_logo_arbitrum.svg'),
    blockExplorer: 'https://mumbai.polygonscan.com',
    relayer: '0xf8a2f1e8fb38a6463a19b838d82a35340678390c',
  },
  56: {
    disabled: true,
    chainId: ChainId.BinanceSmartChain,
    name: 'Binance Smart Chain',
    logo: require('@thxnetwork/wallet/../public/assets/thx_logo_bsc.svg'),
    blockExplorer: 'https://mumbai.polygonscan.com',
    relayer: '',
  },
  80001: {
    disabled: false,
    chainId: ChainId.PolygonMumbai,
    name: 'Polygon Mumbai',
    logo: require('@thxnetwork/wallet/../public/assets/thx_logo_polygon.svg'),
    blockExplorer: 'https://mumbai.polygonscan.com',
    relayer: '',
  },
  137: {
    disabled: false,
    chainId: ChainId.Polygon,
    name: 'Polygon',
    logo: require('@thxnetwork/wallet/../public/assets/thx_logo_polygon.svg'),
    blockExplorer: 'https://polygonscan.com',
    relayer: '0x1ece1975d2372c881d0c27c36f3c4f2df055ee40',
  },
};

if (process.env.NODE_ENV !== 'production') {
  chainInfo[ChainId.Hardhat] = {
    disabled: false,
    chainId: ChainId.Hardhat,
    name: 'Hardhat',
    logo: require('@thxnetwork/wallet/../public/assets/thx_logo_hardhat.svg'),
    blockExplorer: 'https://hardhatscan.com',
    relayer: '0x08302CF8648A961c607e3e7Bd7B7Ec3230c2A6c5',
  };
}

export { chainInfo };
