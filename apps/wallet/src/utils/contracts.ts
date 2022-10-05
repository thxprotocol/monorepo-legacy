import { AbiItem } from 'web3-utils';
import { ContractName, TokenContractName } from "@thxnetwork/artifacts";

export const getAbiForContractName = (contractName: ContractName | TokenContractName): AbiItem[] => {
  return require(`@thxnetwork/artifacts/dist/exports/abis/${contractName}.json`);
};
