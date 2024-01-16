import { ChainId } from '@thxnetwork/types/enums';
import { getProvider } from '@thxnetwork/api/util/network';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { contractConfig, TNetworkName, TokenContractName } from '@thxnetwork/contracts/exports';
import { HARDHAT_NAME, POLYGON_NAME } from '@thxnetwork/api/config/secrets';
import { ContractNetworksConfig } from '@safe-global/protocol-kit';
import { SafeVersion } from '@safe-global/safe-core-sdk-types';

import BPTToken from './contracts/BPTToken.json';
import RewardDistributor from './contracts/RewardDistributor.json';
import SmartWalletWhitelist from './contracts/SmartWalletWhitelist.json';
import VotingEscrow from './contracts/VotingEscrow.json';
import Launchpad from './contracts/Launchpad.json';
import TestToken from './contracts/TestToken.json';
import RewardFaucet from './contracts/RewardFaucet.json';

export const safeVersion: SafeVersion = '1.3.0';

export const contractNetworks = {
    '31337': {
        safeMasterCopyAddress: '0xC44951780f195Ed71145e3d0d2F25726A097C348',
        safeProxyFactoryAddress: '0x1122fD9eBB2a8E7c181Cc77705d2B4cA5D72988A',
        multiSendAddress: '0x7E4728eFfC9376CC7C0EfBCc779cC9833D83a984',
        multiSendCallOnlyAddress: '0x75Cbb6C4Db4Bb4f6F8D5F56072A6cF4Bf4C5413C',
        fallbackHandlerAddress: '0x5D3D550Da6678C0444F5D77Ca086678D9CdeEecA',
        signMessageLibAddress: '0x658FAD2acB6d1E615f295E566ee9a6d32Cc97b10',
        createCallAddress: '0x40Efd8a16485213445E6d8b9a4266Fd2dFf7C69a',
        simulateTxAccessorAddress: '0xFF1eE64b8806C0891e8F73b37f8403F441b552E1',
    },
} as ContractNetworksConfig;

export const contractArtifacts: { [contractName: string]: { abi: any; bytecode: string } } = {
    BPTToken,
    TestToken,
    RewardFaucet,
    RewardDistributor,
    SmartWalletWhitelist,
    VotingEscrow,
    Launchpad,
};

export const getContractConfig = (
    chainId: ChainId,
    contractName: TokenContractName,
): { address: string; abi: AbiItem[] } => {
    return contractConfig(chainIdToName(chainId), contractName);
};

export const getContractFromAbi = (chainId: ChainId, abi: AbiItem[], address?: string): Contract => {
    const { web3 } = getProvider(chainId);
    return new web3.eth.Contract(abi, address) as unknown as Contract;
};

export const getAbiForContractName = (contractName: TokenContractName): AbiItem[] => {
    return require(`../../../../../libs/contracts/exports/abis/${contractName}.json`);
};

export const getByteCodeForContractName = (contractName: TokenContractName): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`../../../../../libs/contracts/exports/bytecodes/${contractName}.json`).bytecode;
};

export const getContractFromName = (chainId: ChainId, contractName: TokenContractName, address?: string) => {
    return getContractFromAbi(chainId, getAbiForContractName(contractName), address);
};

export const getContract = (chainId: ChainId, contractName: TokenContractName) => {
    return getContractFromName(chainId, contractName, getContractConfig(chainId, contractName).address);
};

const chainIdToName = (chainId: ChainId): TNetworkName => {
    switch (chainId) {
        case ChainId.Polygon:
            return POLYGON_NAME as TNetworkName;
        case ChainId.Hardhat:
            return HARDHAT_NAME as TNetworkName;
    }
};
