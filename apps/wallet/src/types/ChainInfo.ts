interface AddEthereumChainParameter {
    chainId: string; // A 0x-prefixed hexadecimal string
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string; // 2-6 characters long
        decimals: 18;
    };
    rpcUrls: string[];
    blockExplorerUrls?: string[];
    iconUrls?: string[]; // Currently ignored.
}

export type ChainInfo = {
    disabled: boolean;
    logo: any;
    name: string;
    chainId: number;
    relayer: string;
    blockExplorer: string;
    metamask?: AddEthereumChainParameter;
};
