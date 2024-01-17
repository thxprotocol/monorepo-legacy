import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { TransactionReceipt } from 'web3-eth-accounts/node_modules/web3-core';
import { getByteCodeForContractName, getContractFromName } from '@thxnetwork/api/services/ContractService';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ERC1155, ERC1155Document, IERC1155Updates } from '@thxnetwork/api/models/ERC1155';
import { ERC1155Metadata, ERC1155MetadataDocument } from '@thxnetwork/api/models/ERC1155Metadata';
import { ERC1155Token, ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import { ChainId, TransactionState } from '@thxnetwork/types/enums';
import { ERC1155TokenState } from '@thxnetwork/types/interfaces';
import {
    TERC1155DeployCallbackArgs,
    TERC1155TokenMintCallbackArgs,
    TERC1155TransferFromCallbackArgs,
    TERC1155TransferFromWalletCallbackArgs,
} from '@thxnetwork/api/types/TTransaction';
import { assertEvent, ExpectedEventNotFound, findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { getProvider } from '@thxnetwork/api/util/network';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import PoolService from './PoolService';
import TransactionService from './TransactionService';
import type { TAccount, TERC1155, TERC1155Metadata, TERC1155Token } from '@thxnetwork/types/interfaces';
import { WalletDocument } from '../models/Wallet';
import IPFSService from './IPFSService';
import SafeService from './SafeService';
import { API_URL, VERSION } from '../config/secrets';
import { ERC721Perk } from '../models/ERC721Perk';

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

const initialize = async (pool: AssetPoolDocument, address: string) => {
    const erc1155 = await findByQuery({ address, chainId: pool.chainId });
    await addMinter(erc1155, pool.address);
};

export async function findById(id: string): Promise<ERC1155Document> {
    const erc1155 = await ERC1155.findById(id);
    if (!erc1155) return;
    erc1155.logoImgUrl || erc1155.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${erc1155.address}`;
    return erc1155;
}

export async function findBySub(sub: string, includeIsArchived: boolean): Promise<ERC1155Document[]> {
    const pools = await PoolService.getAllBySub(sub, includeIsArchived);
    const nftRewards = await ERC721Perk.find({ poolId: pools.map((p) => String(p._id)) });
    const erc1155Ids = nftRewards.map((c) => c.erc1155Id);
    const erc1155s = await ERC1155.find({ sub, archived: includeIsArchived });

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
    pool: AssetPoolDocument,
    erc1155: ERC1155Document,
    metadata: ERC1155MetadataDocument,
    amount: string,
    wallet: WalletDocument,
    forceSync = true,
): Promise<ERC1155TokenDocument> {
    const tokenUri = await IPFSService.getTokenURI(erc1155, String(metadata._id));
    const erc1155token = await ERC1155Token.findOneAndUpdate(
        {
            erc1155Id: String(erc1155._id),
            walletId: String(wallet._id),
            tokenId: metadata.tokenId,
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

    const txId = await TransactionService.sendAsync(
        pool.contract.options.address,
        pool.contract.methods.mintForERC1155(erc1155.address, wallet.address, metadata.tokenId, amount),
        pool.chainId,
        forceSync,
        {
            type: 'erc1155TokenMintCallback',
            args: { erc1155tokenId: String(erc1155token._id), assetPoolId: String(pool._id) },
        },
    );

    return ERC1155Token.findByIdAndUpdate(
        erc1155token._id,
        { transactions: [txId], state: ERC1155TokenState.Transferring },
        { new: true },
    );
}

export async function mintCallback(args: TERC1155TokenMintCallbackArgs, receipt: TransactionReceipt) {
    const { assetPoolId, erc1155tokenId } = args;
    const { contract } = await PoolService.getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);
    const event = assertEvent('ERC1155MintedSingle', events);

    await ERC1155Token.findByIdAndUpdate(erc1155tokenId, {
        state: ERC1155TokenState.Minted,
        tokenId: Number(event.args.tokenId),
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
    pool: AssetPoolDocument,
    erc1155Token: ERC1155TokenDocument,
    erc1155: ERC1155Document,
    wallet: WalletDocument,
    amount: string,
    forceSync = true,
): Promise<ERC1155TokenDocument> {
    const txId = await TransactionService.sendAsync(
        pool.contract.options.address,
        pool.contract.methods.transferFromERC1155(erc1155.address, wallet.address, erc1155Token.tokenId, amount),
        pool.chainId,
        forceSync,
        {
            type: 'erc1155TransferFromCallback',
            args: {
                erc1155Id: String(erc1155._id),
                erc1155TokenId: String(erc1155Token._id),
                sub: wallet.sub,
                assetPoolId: String(pool._id),
            },
        },
    );

    return ERC1155Token.findByIdAndUpdate(erc1155Token._id, { transactions: [txId] }, { new: true });
}

export async function transferFromCallback(args: TERC1155TransferFromCallbackArgs, receipt: TransactionReceipt) {
    const { assetPoolId, erc1155TokenId, sub } = args;
    const { contract, chainId } = await PoolService.getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);
    const event = assertEvent('ERC71155TransferredSingle', events);
    const wallet = await SafeService.findPrimary(sub, chainId);

    await ERC1155Token.findByIdAndUpdate(erc1155TokenId, {
        sub,
        state: ERC1155TokenState.Transferred,
        tokenId: Number(event.args.tokenId),
        recipient: event.args.to,
        walletId: wallet && String(wallet._id),
    });
}

export async function transferFromWallet(
    safe: WalletDocument,
    erc1155: ERC1155Document,
    erc1155Token: ERC1155TokenDocument,
    wallet: WalletDocument,
): Promise<any> {
    const tx = await TransactionService.sendSafeAsync(
        safe,
        erc1155.address,
        erc1155.contract.methods.transferFrom(safe.address, wallet.address, erc1155Token.tokenId),
        {
            type: 'erc721TransferFromWalletCallback',
            args: {
                walletId: String(safe._id),
                erc721Id: String(erc1155._id),
                erc721TokenId: String(erc1155Token._id),
                to: wallet.address,
            },
        },
    );

    return await ERC1155Token.findByIdAndUpdate(erc1155Token._id, { transactions: [String(tx._id)] }, { new: true });
}

export async function transferFromWalletCallback(
    args: TERC1155TransferFromWalletCallbackArgs,
    receipt: TransactionReceipt,
) {
    const { erc1155Id, erc1155TokenId, to } = args;
    const { contract } = await ERC1155.findById(erc1155Id);
    const { tokenId } = await ERC1155Token.findById(erc1155TokenId);
    const ownerOfToken = await contract.methods.ownerOf(tokenId).call();

    if (receipt) {
        // TODO implement event assert after contract events for success transfers become available
    }
    // Throwing manually due to missing contract events for successful transfers
    if (ownerOfToken !== to) throw new Error('ERC721Transfer tx failed.');

    const toWallet = await SafeService.findOneByAddress(to);
    await ERC1155Token.findByIdAndUpdate(erc1155TokenId, {
        state: ERC1155TokenState.Transferred,
        recipient: to,
        sub: toWallet ? toWallet.sub : '',
        walletId: toWallet ? String(toWallet._id) : '',
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

async function findMetadataById(id: string): Promise<ERC1155MetadataDocument> {
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

async function findMetadataByNFT(erc1155Id: string, page = 1, limit = 10, q?: string) {
    let query;
    if (q && q != 'null' && q != 'undefined') {
        query = { erc1155Id, title: { $regex: `.*${q}.*`, $options: 'i' } };
    } else {
        query = { erc1155Id };
    }

    const paginatedResult = await paginatedResults(ERC1155Metadata, page, limit, query);
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

export const update = (erc1155: ERC1155Document, updates: IERC1155Updates) => {
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
    transferFromWallet,
    transferFromWalletCallback,
    queryDeployTransaction,
    getOnChainERC1155Token,
    findTokensByWallet,
};
