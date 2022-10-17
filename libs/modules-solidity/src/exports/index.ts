import { version as currentVersion } from '../package.json';
import { AbiItem } from 'web3-utils';
import fs from 'fs';
import path from 'path';

export const networkNames = ['mumbai', 'matic', 'mumbaidev', 'maticdev', 'hardhat'] as const;
export type TNetworkName = typeof networkNames[number];

export const contractNames = [
    'AssetPoolRegistry',
    'AssetPoolFactory',
    'TokenFactory',
    'LimitedSupplyToken',
    'AccessControl',
    'MemberAccess',
    'Token',
    'BasePollProxy',
    'RelayHubFacet',
    'Withdraw',
    'WithdrawPoll',
    'WithdrawPollProxy',
    'WithdrawBy',
    'WithdrawByPoll',
    'WithdrawByPollProxy',
    'DiamondCutFacet',
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'AssetPoolFactoryFacet',
    'TokenFactoryFacet',
    'PoolRegistryFacet',
] as const;
export type ContractName = typeof contractNames[number];

export interface ContractConfig {
    address: string;
    abi: AbiItem[];
}

export interface ExportJsonFile {
    name: string;
    chainId: string;
    contracts: { [key: string]: ContractConfig };
}

export type DiamondVariant = 'defaultPool' | 'assetPoolFactory' | 'tokenFactory' | 'assetPoolRegistry';
const diamondVariantsConfig: { [key in DiamondVariant]: ContractName[] } = {
    defaultPool: [
        'AccessControl',
        'MemberAccess',
        'Token',
        'BasePollProxy',
        'RelayHubFacet',
        'WithdrawBy',
        'WithdrawByPoll',
        'WithdrawByPollProxy',
    ],
    assetPoolFactory: ['AssetPoolFactoryFacet'],
    tokenFactory: ['TokenFactoryFacet'],
    assetPoolRegistry: ['PoolRegistryFacet'],
};

export const diamondVariants = Object.keys(diamondVariantsConfig) as DiamondVariant[];

const cache: { [key in TNetworkName]: { versions: string[]; contracts: { [version: string]: ExportJsonFile } } } = {
    hardhat: { versions: [], contracts: {} },
    matic: { versions: [], contracts: {} },
    mumbai: { versions: [], contracts: {} },
    maticdev: { versions: [], contracts: {} },
    mumbaidev: { versions: [], contracts: {} },
};

const getArtifacts = (network: TNetworkName, version: string) => {
    if (!cache[network].contracts[version]) {
        if (!availableVersions(network).includes(version)) {
            throw new Error(`No contracts for version ${version} available for network ${network}`);
        }

        const v = network === 'hardhat' ? 'latest' : version;
        cache[network].contracts[version] = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, './', network, `${v}.json`)).toString(),
        );
    }

    return cache[network].contracts[version];
};

export const diamondFacetNames = (variant: DiamondVariant): ContractName[] => {
    return [...diamondVariantsConfig[variant], 'DiamondCutFacet', 'DiamondLoupeFacet', 'OwnershipFacet'];
};

export const diamondFacetConfigs = (network: TNetworkName, variant: DiamondVariant, version?: string) => {
    const result: { [name in ContractName]?: ContractConfig } = {};

    const facetNames = diamondFacetNames(variant);
    facetNames.forEach((name) => (result[name] = contractConfig(network, name, version)));

    return result;
};

export const diamondAbi = (network: TNetworkName, variant: DiamondVariant, version?: string) => {
    const result: AbiItem[] = [];

    for (const contractName of diamondFacetNames(variant)) {
        const abi = contractConfig(network, contractName, version).abi;
        for (const abiItem of abi) {
            if (!result.find((item) => item.type == abiItem.type && item.name == abiItem.name)) result.push(abiItem);
        }
    }

    return result;
};

export const contractConfig = (
    network: TNetworkName,
    contractName: ContractName,
    version?: string | undefined,
): ContractConfig => {
    const artifacts = getArtifacts(network, version || currentVersion);

    return artifacts.contracts[contractName];
};

export const availableVersions = (network: TNetworkName): string[] => {
    if (network === 'hardhat') return [currentVersion];

    if (cache[network].versions.length === 0) {
        const list = fs.readdirSync(path.resolve(__dirname, './', network));
        cache[network].versions = list.map((filename) => filename.substring(0, filename.length - 5));
    }

    return cache[network].versions;
};

export { currentVersion };
