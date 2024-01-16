import { ContractReceipt, ContractTransaction } from 'ethers';
import { TokenContractName } from '../exports';
import { ethers } from 'hardhat';

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

export const deployToken = async (contractName: TokenContractName, args: any[]) => {
    const factory = await ethers.getContractFactory(contractName);
    const erc20 = await factory.deploy(...args);
    return await ethers.getContractAt(contractName, erc20.address);
};
