import { constants, Contract, ContractReceipt, ContractTransaction } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { ContractName, TokenContractName } from 'exports';
import { FacetCut } from 'hardhat-deploy/types';

export enum FacetCutAction {
    Add,
    Replace,
    Remove,
}

export const getDiamondCuts = async (facetContractNames: ContractName[]) => {
    const diamondCut = [];
    facetContractNames = facetContractNames.concat([
        'DiamondCutFacet',
        'DiamondLoupeFacet',
        'OwnershipFacet',
    ] as ContractName[]);
    for (const facetName of facetContractNames) {
        const factory = await ethers.getContractFactory(facetName);
        const facet = await factory.deploy();
        diamondCut.push({
            action: FacetCutAction.Add,
            facetAddress: facet.address,
            functionSelectors: getSelectors(facet),
        });
    }

    return diamondCut;
};

export const findEvent = async (tx: ContractTransaction, eventName: string) => {
    const receipt: ContractReceipt = await tx.wait();
    return receipt.events?.find((ev) => ev.event == eventName);
};

export const filterEvents = (events: any[], eventName: string) => {
    return events.filter((ev) => ev.event == eventName);
};

export const timestamp = async (tx: ContractReceipt) => {
    return (await ethers.provider.getBlock(tx.blockNumber)).timestamp;
};

export const getSelectors = function (contract: Contract) {
    const signatures = [];
    for (const key of Object.keys(contract.functions)) {
        signatures.push(keccak256(toUtf8Bytes(key)).substr(0, 10));
    }
    return signatures;
};

export const deployToken = async (contractName: TokenContractName, args: any[]) => {
    const factory = await ethers.getContractFactory(contractName);
    const erc20 = await factory.deploy(...args);
    return await ethers.getContractAt(contractName, erc20.address);
};

export const deploy = async (factory: Contract, diamondCuts: FacetCut[], erc20: string, erc721 = ADDRESS_ZERO) => {
    const tx = await factory.deploy(diamondCuts, erc20, erc721);
    const event = await findEvent(tx, 'DiamondDeployed');
    return await ethers.getContractAt('IDefaultDiamond', event?.args?.diamond);
};

export const deployFactory = async (owner: string, registry: string) => {
    const diamondCuts = await getDiamondCuts(['FactoryFacet']);
    const DiamondFactory = await ethers.getContractFactory('Diamond');
    const diamond = await DiamondFactory.deploy(diamondCuts, [owner]);
    const factory = await ethers.getContractAt('IFactory', diamond.address);

    await factory.initialize(owner, registry);

    return factory;
};

export const deployRegistry = async (feeCollector: string, feePercentage: string) => {
    const [owner] = await ethers.getSigners();
    const diamondCuts = await getDiamondCuts(['RegistryFacet']);
    const DiamondFactory = await ethers.getContractFactory('Diamond');
    const diamond = await DiamondFactory.deploy(diamondCuts, [await owner.getAddress()]);
    const registry = await ethers.getContractAt('IRegistry', diamond.address);

    await registry.initialize(feeCollector, feePercentage);

    return registry;
};

export function createUnlockDate(numMonths: number) {
    // create unlock date adding 3 months to current time
    const now = new Date();
    var newDate = new Date(now.setMonth(now.getMonth() + numMonths));
    const unlockDate = newDate.getTime() / 1000;
    return ~~unlockDate;
}

export const MINTER_ROLE = keccak256(toUtf8Bytes('MINTER_ROLE'));
export const ADDRESS_ZERO = constants.AddressZero;
