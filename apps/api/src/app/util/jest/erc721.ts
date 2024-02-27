import { API_URL, MINIMUM_GAS_LIMIT, VERSION } from '@thxnetwork/api/config/secrets';
import ContractService from '@thxnetwork/api/services/ContractService';
import { ChainId } from '@thxnetwork/common/enums';
import { getProvider } from '../network';

export async function deployERC721(nftName: string, nftSymbol: string) {
    const { web3, defaultAccount } = getProvider(ChainId.Hardhat);
    const contractName = 'NonFungibleToken';
    const contract = ContractService.getContractFromName(ChainId.Hardhat, contractName);
    const bytecode = ContractService.getByteCodeForContractName(contractName);
    const baseURL = `${API_URL}/${VERSION}/erc721/metadata/`;
    const fn = contract.deploy({
        data: bytecode,
        arguments: [nftName, nftSymbol, baseURL, defaultAccount],
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

export const mockGetNftsForOwner = (contractAddress: string, nftName: string, nftSymbol: string) => {
    return {
        ownedNfts: [
            {
                contract: {
                    address: contractAddress,
                    name: nftName,
                    symbol: nftSymbol,
                },
                tokenId: '1',
                tokenUri: {
                    raw: 'https://ipfs.io/ipfs/QmRvCinGkzqDdmSZ3PzQRyHbQVqaFLTDyfyMMD54Bwcjsi',
                },
                rawMetadata: {
                    name: '#1',
                    description: 'image description piece #1',
                    image: 'https://gateway.pinata.cloud/ipfs/QmemtAVJMkfUj3bAXee1H7vccbX6nC6Vbkbu6gBjdn1Kdh/1.png',
                    external_url: 'https://externalurl.com',
                },
            },
        ],
        pageKey: 1,
        totalCount: 1,
    };
};
