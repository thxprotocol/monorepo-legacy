import { ChainId } from '@thxnetwork/common/enums';
import { ChainInfo } from '@thxnetwork/dashboard/types/ChainInfo';

const chainInfo: { [chainId: number]: ChainInfo } = {
    [ChainId.Ethereum]: {
        disabled: true,
        chainId: ChainId.Ethereum,
        name: 'Ethereum',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_ethereum.svg'),
        blockExplorer: 'https://mumbai.polygonscan.com',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Arbitrum]: {
        disabled: true,
        chainId: ChainId.Arbitrum,
        name: 'Arbitrum',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_arbitrum.svg'),
        blockExplorer: 'https://arbiscan.io',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.BNBChain]: {
        disabled: true,
        chainId: ChainId.BNBChain,
        name: 'Binance Smart Chain',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_bsc.svg'),
        blockExplorer: 'https://mumbai.polygonscan.com',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Polygon]: {
        disabled: false,
        chainId: ChainId.Polygon,
        name: 'Polygon',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_polygon.svg'),
        blockExplorer: 'https://polygonscan.com',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.PolygonZK]: {
        disabled: true,
        chainId: ChainId.PolygonZK,
        name: 'Polygon zkEVM',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_polygon.svg'),
        blockExplorer: 'https://zkevm.polygonscan.com',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Linea]: {
        disabled: false,
        chainId: ChainId.Linea,
        name: 'Linea',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_linea.svg'),
        blockExplorer: 'https://lineascan.build',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Metis]: {
        disabled: false,
        chainId: ChainId.Metis,
        name: 'Metis',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_metis.svg'),
        blockExplorer: 'https://explorer.metis.io',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Base]: {
        disabled: true,
        chainId: ChainId.Base,
        name: 'Base',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_base.svg'),
        blockExplorer: 'https://basescan.org',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.IOTA]: {
        disabled: true,
        chainId: ChainId.IOTA,
        name: 'IOTA EVM',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_iota.svg'),
        blockExplorer: 'https://explorer.evm.iota.org',
        safeURL: 'https://app.safe.global',
    },
};

if (process.env.NODE_ENV !== 'production') {
    chainInfo[ChainId.Hardhat] = {
        disabled: false,
        chainId: ChainId.Hardhat,
        name: 'Hardhat',
        logo: require('@thxnetwork/dashboard/../public/assets/thx_logo_hardhat.svg'),
        blockExplorer: 'https://hardhatscan.com',
        safeURL: 'https://app.safe.global',
    };
}

export function getTokenURL(chainId: ChainId, address: string) {
    return `${chainInfo[chainId].blockExplorer}/token/${address}`;
}

export function getAddressURL(chainId: ChainId, address: string) {
    return `${chainInfo[chainId].blockExplorer}/address/${address}`;
}

export { chainInfo };
