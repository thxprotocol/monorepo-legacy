import { API_URL, MINIMUM_GAS_LIMIT, VERSION } from '@thxnetwork/api/config/secrets';
import { getByteCodeForContractName, getContractFromName } from '@thxnetwork/api/services/ContractService';
import { ChainId } from '@thxnetwork/common/enums';
import { getProvider } from '../network';

export async function deployERC1155(chainId = ChainId.Hardhat) {
    const { web3, defaultAccount } = getProvider(chainId);
    const contractName = 'THX_ERC1155';
    const contract = getContractFromName(chainId, contractName);
    const bytecode = getByteCodeForContractName(contractName);
    const baseURL = `${API_URL}/${VERSION}/erc1155/metadata/{id}`;
    const fn = contract.deploy({
        data: bytecode,
        arguments: [baseURL, defaultAccount],
    });
    const data = fn.encodeABI();
    const estimate = await fn.estimateGas({ from: defaultAccount });
    const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;
    const receipt = await web3.eth.sendTransaction({
        from: defaultAccount,
        to: null,
        data,
        gas,
    });

    contract.options.address = receipt.contractAddress;

    return contract;
}

export const mockGetNftsForOwner = (contractAddress: string) => {
    return {
        ownedNfts: [
            {
                contract: {
                    address: contractAddress,
                },
                tokenId: '1',
                tokenUri: {
                    raw: 'https://ipfs.io/ipfs/QmRvCinGkzqDdmSZ3PzQRyHbQVqaFLTDyfyMMD54Bwcjsi',
                },
                rawMetadata: {
                    name: '#1',
                    description: 'image description piece #1',
                    image: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/1.png',
                },
            },
        ],
        pageKey: 1,
        totalCount: 1,
    };
};
