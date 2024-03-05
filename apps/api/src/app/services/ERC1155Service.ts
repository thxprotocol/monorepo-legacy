import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { TransactionReceipt } from 'web3-eth-accounts/node_modules/web3-core';
import { ChainId, TransactionState, ERC1155TokenState } from '@thxnetwork/common/enums';
import {
    getAbiForContractName,
    getByteCodeForContractName,
    getContractFromName,
} from '@thxnetwork/api/services/ContractService';
import { getProvider } from '@thxnetwork/api/util/network';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { assertEvent, ExpectedEventNotFound, findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { API_URL, VERSION } from '../config/secrets';
import TransactionService from './TransactionService';
import PoolService from './PoolService';
import IPFSService from './IPFSService';
import SafeService from './SafeService';
import {
    Transaction,
    ERC1155Document,
    ERC1155,
    PoolDocument,
    RewardNFT,
    ERC1155MetadataDocument,
    ERC1155Metadata,
    WalletDocument,
    ERC1155TokenDocument,
    ERC1155Token,
} from '@thxnetwork/api/models';

const contractName = 'THX_ERC1155';

async function deploy(data: TERC1155, forceSync = true): Promise<ERC1155Document> {
    const { defaultAccount } = getProvider(data.chainId);
    const contract = getContractFromName(data.chainId, contractName);
    const bytecode = getByteCodeForContractName(contractName);
    const erc1155 = await ERC1155.create(data);
    const baseURL = getBaseURL(erc1155);
    const fn = contract.deploy({
        data: bytecode,
        arguments: [baseURL, defaultAccount],
    });

    const txId = await TransactionService.sendAsync(null, fn, erc1155.chainId, forceSync, {
        type: 'ERC1155DeployCallback',
        args: { erc1155Id: String(erc1155._id) },
    });

    return ERC1155.findByIdAndUpdate(erc1155._id, { transactions: [txId], baseURL }, { new: true });
}

async function deployCallback({ erc1155Id }: TERC1155DeployCallbackArgs, receipt: TransactionReceipt) {
    const erc1155 = await ERC1155.findById(erc1155Id);
    const contract = getContractFromName(erc1155.chainId, contractName);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);

    if (!findEvent('OwnershipTransferred', events) && !findEvent('Transfer', events)) {
        throw new ExpectedEventNotFound('Transfer or OwnershipTransferred');
    }

    await ERC1155.findByIdAndUpdate(erc1155Id, { address: receipt.contractAddress });
}

export async function queryDeployTransaction(erc1155: ERC1155Document): Promise<ERC1155Document> {
    if (!erc1155.address && erc1155.transactions[0]) {
        const tx = await Transaction.findById(erc1155.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc1155 = await findById(erc1155._id);
        }
    }

    return erc1155;
}

function getBaseURL(erc1155: ERC1155Document) {
    return `${API_URL}/${VERSION}/metadata/erc1155/${String(erc1155._id)}/{id}`;
}

const initialize = async (pool: PoolDocument, address: string) => {
    const erc1155 = await findByQuery({ address, chainId: pool.chainId });
    await addMinter(erc1155, pool.safeAddress);
};

export async function findById(id: string): Promise<ERC1155Document> {
    const erc1155 = await ERC1155.findById(id);
    if (!erc1155) return;
    erc1155.logoImgUrl || erc1155.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${erc1155.address}`;
    return erc1155;
}

export async function findBySub(sub: string): Promise<ERC1155Document[]> {
    const pools = await PoolService.getAllBySub(sub);
    const nftRewards = await RewardNFT.find({ poolId: pools.map((p) => String(p._id)) });
    const erc1155Ids = nftRewards.map((c) => c.erc1155Id);
    const erc1155s = await ERC1155.find({ sub });

    return erc1155s.concat(await ERC1155.find({ _id: erc1155Ids }));
}

export async function createMetadata(erc1155: ERC1155Document, attributes: any): Promise<ERC1155MetadataDocument> {
    return ERC1155Metadata.create({
        erc1155: String(erc1155._id),
        attributes,
    });
}

export async function deleteMetadata(id: string) {
    return ERC1155Metadata.findOneAndDelete({ _id: id });
}

export async function mint(
    safe: WalletDocument,
    erc1155: ERC1155Document,
    wallet: WalletDocument,
    metadata: ERC1155MetadataDocument,
    amount: string,
): Promise<ERC1155TokenDocument> {
    const tokenUri = await IPFSService.getTokenURI(erc1155, String(metadata._id), String(metadata.tokenId));
    const erc1155token = await ERC1155Token.findOneAndUpdate(
        {
            erc1155Id: String(erc1155._id),
            tokenId: metadata.tokenId,
            sub: wallet.sub,
            walletId: String(wallet._id),
        },
        {
            sub: wallet.sub,
            tokenUri: erc1155.baseURL.replace('{id}', tokenUri),
            recipient: wallet.address,
            state: ERC1155TokenState.Pending,
            erc1155Id: String(erc1155._id),
            metadataId: String(metadata._id),
            walletId: String(wallet._id),
            tokenId: metadata.tokenId,
        },
        { upsert: true, new: true },
    );

    const tx = await TransactionService.sendSafeAsync(
        safe,
        erc1155.address,
        erc1155.contract.methods.mint(wallet.address, metadata.tokenId, amount, '0x'),
        {
            type: 'erc1155TokenMintCallback',
            args: { erc1155tokenId: String(erc1155token._id) },
        },
    );

    return await ERC1155Token.findByIdAndUpdate(
        erc1155token._id,
        { transactions: [tx._id], state: ERC1155TokenState.Transferring },
        { new: true },
    );
}

export async function mintCallback(args: TERC1155TokenMintCallbackArgs, receipt: TransactionReceipt) {
    const { erc1155tokenId } = args;
    const abi = getAbiForContractName('THX_ERC1155');
    const events = parseLogs(abi, receipt.logs);
    const event = assertEvent('TransferSingle', events);

    await ERC1155Token.findByIdAndUpdate(erc1155tokenId, {
        state: ERC1155TokenState.Minted,
        tokenId: event.args.id,
        recipient: event.args.recipient,
    });
}

export async function queryMintTransaction(erc1155Token: ERC1155TokenDocument): Promise<ERC1155TokenDocument> {
    if (erc1155Token.state === ERC1155TokenState.Pending && erc1155Token.transactions[0]) {
        const tx = await Transaction.findById(erc1155Token.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc1155Token = await findTokenById(erc1155Token._id);
        }
    }
    return erc1155Token;
}

export async function transferFrom(
    erc1155: ERC1155Document,
    wallet: WalletDocument,
    to: string,
    erc1155Token: ERC1155TokenDocument,
    amount: string,
): Promise<ERC1155TokenDocument> {
    const toWallet = await SafeService.findOne({ address: to, chainId: erc1155.chainId });
    const tx = await TransactionService.sendSafeAsync(
        wallet,
        erc1155.address,
        erc1155.contract.methods.safeTransferFrom(wallet.address, to, erc1155Token.tokenId, amount, '0x'),
        {
            type: 'erc1155TransferFromCallback',
            args: {
                erc1155Id: String(erc1155._id),
                erc1155TokenId: String(erc1155Token._id),
                walletId: toWallet && toWallet.id,
            },
        },
    );
    const metadata = await ERC1155Metadata.findById(erc1155Token.metadataId);

    await ERC1155Token.findOneAndUpdate(
        {
            erc1155Id: String(erc1155._id),
            tokenId: metadata.tokenId,
            sub: wallet.sub,
            walletId: String(wallet._id),
        },
        {
            sub: wallet.sub,
            tokenUri: erc1155.baseURL.replace('{id}', erc1155Token.tokenUri),
            recipient: wallet.address,
            state: ERC1155TokenState.Pending,
            erc1155Id: String(erc1155._id),
            metadataId: String(metadata._id),
            walletId: String(wallet._id),
            tokenId: metadata.tokenId,
        },
        { upsert: true, new: true },
    );

    return await ERC1155Token.findByIdAndUpdate(
        erc1155Token._id,
        { transactions: [String(tx._id)], state: ERC1155TokenState.Transferring },
        { new: true },
    );
}

export async function transferFromCallback(args: TERC1155TransferFromCallbackArgs, receipt: TransactionReceipt) {
    const { erc1155TokenId, walletId } = args;
    const abi = getAbiForContractName('THX_ERC1155');
    const events = parseLogs(abi, receipt.logs);
    const event = assertEvent('TransferSingle', events);
    const wallet = await SafeService.findById(walletId);

    await ERC1155Token.findByIdAndUpdate(erc1155TokenId, {
        state: ERC1155TokenState.Transferred,
        tokenId: event.args.id,
        recipient: event.args.to,
        sub: wallet && wallet.sub,
        walletId: wallet && wallet.id,
    });
}

async function isMinter(erc1155: ERC1155Document, address: string) {
    return await erc1155.contract.methods.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address).call();
}

async function addMinter(erc1155: ERC1155Document, address: string) {
    const receipt = await TransactionService.send(
        erc1155.address,
        erc1155.contract.methods.grantRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address),
        erc1155.chainId,
    );

    assertEvent('RoleGranted', parseLogs(erc1155.contract.options.jsonInterface, receipt.logs));
}

async function findMetadataByToken(token: TERC1155Token) {
    return ERC1155Metadata.findById(token.metadataId);
}

async function findTokenById(id: string): Promise<ERC1155TokenDocument> {
    return ERC1155Token.findById(id);
}

async function findTokensByMetadataAndSub(metadataId: string, account: TAccount): Promise<ERC1155TokenDocument[]> {
    return ERC1155Token.find({ sub: account.sub, metadataId });
}

async function findTokensBySub(sub: string): Promise<ERC1155TokenDocument[]> {
    return ERC1155Token.find({ sub });
}

async function findTokensByWallet(wallet: WalletDocument): Promise<ERC1155TokenDocument[]> {
    return ERC1155Token.find({ walletId: wallet._id });
}

async function findMetadataById(id: string) {
    return ERC1155Metadata.findById(id);
}

async function findTokensByRecipient(recipient: string, erc1155Id: string): Promise<TERC1155Token[]> {
    const result = [];
    for await (const token of ERC1155Token.find({ recipient, erc1155Id })) {
        const metadata = await ERC1155Metadata.findById(token.metadataId);
        result.push({ ...(token.toJSON() as TERC1155Token), metadata });
    }
    return result;
}

async function findTokensByMetadata(metadata: ERC1155MetadataDocument): Promise<TERC1155Token[]> {
    return ERC1155Token.find({ metadataId: String(metadata._id) });
}

async function findMetadataByNFT(erc1155Id: string, page = 1, limit = 10) {
    const paginatedResult = await paginatedResults(ERC1155Metadata, page, limit, { erc1155Id });
    const results: TERC1155Metadata[] = [];
    for (const metadata of paginatedResult.results) {
        const tokens = (await this.findTokensByMetadata(metadata)).map((m: ERC1155MetadataDocument) => m.toJSON());
        results.push({ ...metadata.toJSON(), tokens });
    }
    paginatedResult.results = results;
    return paginatedResult;
}

async function findByQuery(query: { poolAddress?: string; address?: string; chainId?: ChainId }) {
    return ERC1155.findOne(query);
}

export const update = (erc1155: ERC1155Document, updates: Partial<TERC1155>) => {
    return ERC1155.findByIdAndUpdate(erc1155._id, updates, { new: true });
};

export const getOnChainERC1155Token = async (chainId: number, address: string) => {
    const contract = getContractFromName(chainId, contractName, address);
    const uri = await contract.methods.uri(1).call();

    return { uri };
};

export default {
    deploy,
    deployCallback,
    findById,
    createMetadata,
    deleteMetadata,
    mint,
    mintCallback,
    queryMintTransaction,
    findBySub,
    findTokenById,
    findTokensByMetadataAndSub,
    findTokensByMetadata,
    findTokensBySub,
    findMetadataById,
    findMetadataByNFT,
    findTokensByRecipient,
    findByQuery,
    addMinter,
    isMinter,
    update,
    initialize,
    transferFrom,
    transferFromCallback,
    queryDeployTransaction,
    getOnChainERC1155Token,
    findTokensByWallet,
    findMetadataByToken,
};
