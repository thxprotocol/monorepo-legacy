import { version as currentVersion } from '../package.json';
import { AbiItem } from 'web3-utils';
import BPTToken from './abis/BPTToken.json';
import RewardDistributor from './abis/RewardDistributor.json';
import SmartWalletWhitelist from './abis/SmartWalletWhitelist.json';
import VotingEscrow from './abis/VotingEscrow.json';
import Launchpad from './abis/Launchpad.json';
import TestToken from './abis/TestToken.json';
import RewardFaucet from './abis/RewardFaucet.json';
import LensReward from './abis/LensReward.json';
import BalToken from './abis/BalancerToken.json';
import BalMinter from './abis/BalancerMinter.json';
import { ContractNetworksConfig } from '@safe-global/protocol-kit';

export const contractNetworks = {
    '31337': {
        // Safe
        safeMasterCopyAddress: '0xC44951780f195Ed71145e3d0d2F25726A097C348',
        safeProxyFactoryAddress: '0x1122fD9eBB2a8E7c181Cc77705d2B4cA5D72988A',
        multiSendAddress: '0x7E4728eFfC9376CC7C0EfBCc779cC9833D83a984',
        multiSendCallOnlyAddress: '0x75Cbb6C4Db4Bb4f6F8D5F56072A6cF4Bf4C5413C',
        fallbackHandlerAddress: '0x5D3D550Da6678C0444F5D77Ca086678D9CdeEecA',
        signMessageLibAddress: '0x658FAD2acB6d1E615f295E566ee9a6d32Cc97b10',
        createCallAddress: '0x40Efd8a16485213445E6d8b9a4266Fd2dFf7C69a',
        simulateTxAccessorAddress: '0xFF1eE64b8806C0891e8F73b37f8403F441b552E1',
        // VE
        BPTToken: '',
        TestToken: '',
        RewardFaucet: '',
        RewardDistributor: '',
        SmartWalletWhitelist: '',
        VotingEscrow: '',
        Launchpad: '',
        // Tokens
        BPT: '0xe1c01805a21ee0DC535afa93172a5F21CE160649',
        LimitedSupplyToken: '0xf228ADAa4c3D07C8285C1025421afe2c4F320C59',
        UnlimitedSupplyToken: '0x8613B8E442219e4349fa5602C69431131a7ED114',
        NonFungibleToken: '0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8',
        THX_ERC1155: '0xeDdBA2bDeE7c9006944aCF9379Daa64478E02290',
    },
} as ContractNetworksConfig & any;

export const contractArtifacts: { [contractName: string]: { abi: any; bytecode: string } } = {
    BPTToken,
    BPT: BPTToken,
    TestToken,
    RewardFaucet,
    RewardDistributor,
    SmartWalletWhitelist,
    VotingEscrow,
    Launchpad,
    LensReward,
    BalToken,
    BalMinter,
};

export const networkNames = ['matic', 'maticdev', 'hardhat'] as const;
export type TNetworkName = typeof networkNames[number];

export const contractNames = ['BalancerVault'] as const;
export const tokenContractNames = [
    'BPT',
    'LimitedSupplyToken',
    'UnlimitedSupplyToken',
    'NonFungibleToken',
    'UnlimitedSupplyToken',
    'THX_ERC1155',
] as const;
export type TokenContractName = typeof tokenContractNames[number];

export interface ContractConfig {
    address: string;
    abi: AbiItem[];
    bytecode: string;
}

export interface ExportJsonFile {
    name: string;
    chainId: string;
    contracts: { [key: string]: ContractConfig };
}

const cache: { [key in TNetworkName]: { versions: string[]; contracts: { [version: string]: ExportJsonFile } } } = {
    hardhat: { versions: [], contracts: {} },
    matic: { versions: [], contracts: {} },
    maticdev: { versions: [], contracts: {} },
};

const getArtifacts = (network: TNetworkName, version: string) => {
    if (!cache[network].contracts[version]) {
        const v = network === 'hardhat' ? 'latest' : version;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const contract = require(`./${network}/${v}.json`);
        cache[network].contracts[version] = contract;
    }

    return cache[network].contracts[version];
};

export const contractConfig = (network: TNetworkName, contractName: TokenContractName): ContractConfig => {
    const artifacts = getArtifacts(network, currentVersion);
    return artifacts.contracts[contractName];
};

export const networkChainId = (network: TNetworkName): string => {
    return getArtifacts(network, currentVersion).chainId;
};

export { currentVersion };
