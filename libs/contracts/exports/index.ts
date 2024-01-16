import { version as currentVersion } from '../package.json';
import { AbiItem } from 'web3-utils';
import fs from 'fs';
import path from 'path';

export const networkNames = ['matic', 'maticdev', 'hardhat'] as const;
export type TNetworkName = typeof networkNames[number];

export const contractNames = ['BalancerVault'] as const;
export const tokenContractNames = [
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
        if (!availableVersions(network).includes(version)) {
            throw new Error(`No contracts for version ${version} available for network ${network}`);
        }

        const v = network === 'hardhat' ? 'latest' : version;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const contract = require(`./${network}/${v}.json`);
        cache[network].contracts[version] = contract;
    }

    return cache[network].contracts[version];
};

export const contractConfig = (
    network: TNetworkName,
    contractName: TokenContractName,
    version?: string | undefined,
): ContractConfig => {
    const artifacts = getArtifacts(network, version || currentVersion);

    return artifacts.contracts[contractName];
};

export const availableVersions = (network: TNetworkName): string[] => {
    if (network === 'hardhat') return [currentVersion];

    if (cache[network].versions.length === 0) {
        const list = fs.readdirSync(path.resolve(process.cwd(), 'libs', 'contracts', 'exports', network));
        cache[network].versions = list.map((filename) => filename.substring(0, filename.length - 5));
    }

    return cache[network].versions;
};

export const networkChainId = (network: TNetworkName): string => {
    return getArtifacts(network, currentVersion).chainId;
};

export { currentVersion };
