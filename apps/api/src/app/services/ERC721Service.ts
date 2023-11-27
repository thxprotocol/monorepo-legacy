import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { TransactionReceipt } from 'web3-eth-accounts/node_modules/web3-core';
import { getByteCodeForContractName, getContractFromName } from '@thxnetwork/api/config/contracts';
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ERC721, ERC721Document, IERC721Updates } from '@thxnetwork/api/models/ERC721';
import { ERC721Metadata, ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { ChainId, TransactionState } from '@thxnetwork/types/enums';
import {
    TERC721DeployCallbackArgs,
    TERC721TokenMintCallbackArgs,
    TERC721TransferFromCallBackArgs,
    TERC721TransferFromWalletCallbackArgs,
} from '@thxnetwork/api/types/TTransaction';
import { assertEvent, ExpectedEventNotFound, findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { getProvider } from '@thxnetwork/api/util/network';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { type TERC721, type TERC721Metadata, type TERC721Token, ERC721TokenState } from '@thxnetwork/types/interfaces';
import { type TAccount } from '@thxnetwork/types/interfaces';
import { WalletDocument } from '../models/Wallet';
import PoolService from './PoolService';
import TransactionService from './TransactionService';
import IPFSService from './IPFSService';
import WalletService from './WalletService';
import { toChecksumAddress } from 'web3-utils';
import { ERC721Perk } from '../models/ERC721Perk';

const contractName = 'NonFungibleToken';

async function deploy(data: TERC721, forceSync = true): Promise<ERC721Document> {
    const { defaultAccount } = getProvider(data.chainId);
    const contract = getContractFromName(data.chainId, contractName);
    const bytecode = getByteCodeForContractName(contractName);
    const erc721 = await ERC721.create(data);
    const fn = contract.deploy({
        data: bytecode,
        arguments: [erc721.name, erc721.symbol, erc721.baseURL, defaultAccount],
    });
    const txId = await TransactionService.sendAsync(null, fn, erc721.chainId, forceSync, {
        type: 'Erc721DeployCallback',
        args: { erc721Id: String(erc721._id) },
    });

    return ERC721.findByIdAndUpdate(erc721._id, { transactions: [txId] }, { new: true });
}

async function deployCallback({ erc721Id }: TERC721DeployCallbackArgs, receipt: TransactionReceipt) {
    const erc721 = await ERC721.findById(erc721Id);
    const contract = getContractFromName(erc721.chainId, contractName);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);

    if (!findEvent('OwnershipTransferred', events) && !findEvent('Transfer', events)) {
        throw new ExpectedEventNotFound('Transfer or OwnershipTransferred');
    }

    await ERC721.findByIdAndUpdate(erc721Id, { address: receipt.contractAddress });
}

export async function queryDeployTransaction(erc721: ERC721Document): Promise<ERC721Document> {
    if (!erc721.address && erc721.transactions[0]) {
        const tx = await Transaction.findById(erc721.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc721 = await findById(erc721._id);
        }
    }

    return erc721;
}

const initialize = async (pool: AssetPoolDocument, address: string) => {
    const erc721 = await findByQuery({ address, chainId: pool.chainId });
    await addMinter(erc721, pool.address);
};

export async function findById(id: string): Promise<ERC721Document> {
    const erc721 = await ERC721.findById(id);
    if (!erc721) return;
    erc721.logoImgUrl = erc721.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${erc721.address}`;
    return erc721;
}

export async function findBySub(sub: string, includeIsArchived: boolean): Promise<ERC721Document[]> {
    const pools = await PoolService.getAllBySub(sub, includeIsArchived);
    const nftRewards = await ERC721Perk.find({ poolId: pools.map((p) => String(p._id)) });
    const erc721Ids = nftRewards.map((c) => c.erc721Id);
    const erc721s = await ERC721.find({ sub, archived: includeIsArchived });

    return erc721s.concat(await ERC721.find({ _id: erc721Ids }));
}

export async function deleteMetadata(id: string) {
    return ERC721Metadata.findOneAndDelete({ _id: id });
}

export async function mint(
    pool: AssetPoolDocument,
    erc721: ERC721Document,
    metadata: ERC721MetadataDocument,
    wallet: WalletDocument,
    forceSync = true,
): Promise<ERC721TokenDocument> {
    const tokenUri = await IPFSService.getTokenURI(erc721, String(metadata._id));
    const erc721token = await ERC721Token.create({
        sub: wallet.sub,
        tokenUri: erc721.baseURL + tokenUri,
        recipient: wallet.address,
        state: ERC721TokenState.Pending,
        erc721Id: String(erc721._id),
        metadataId: String(metadata._id),
        walletId: wallet._id,
    });
    const txId = await TransactionService.sendAsync(
        pool.contract.options.address,
        pool.contract.methods.mintFor(wallet.address, tokenUri, erc721.address),
        pool.chainId,
        forceSync,
        {
            type: 'erc721TokenMintCallback',
            args: { erc721tokenId: String(erc721token._id), assetPoolId: String(pool._id) },
        },
    );

    return ERC721Token.findByIdAndUpdate(
        erc721token._id,
        { transactions: [txId], state: ERC721TokenState.Transferring },
        { new: true },
    );
}

export async function mintCallback(args: TERC721TokenMintCallbackArgs, receipt: TransactionReceipt) {
    const { assetPoolId, erc721tokenId } = args;
    const { contract } = await PoolService.getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);
    const event = assertEvent('ERC721Minted', events);

    await ERC721Token.findByIdAndUpdate(erc721tokenId, {
        state: ERC721TokenState.Minted,
        tokenId: Number(event.args.tokenId),
        recipient: event.args.recipient,
    });
}

export async function queryMintTransaction(erc721Token: ERC721TokenDocument): Promise<ERC721TokenDocument> {
    if (erc721Token.state === ERC721TokenState.Pending && erc721Token.transactions[0]) {
        const tx = await Transaction.findById(erc721Token.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc721Token = await findTokenById(erc721Token._id);
        }
    }

    return erc721Token;
}

export function parseAttributes(entry: ERC721MetadataDocument) {
    return {
        name: entry.name,
        description: entry.description,
        image: entry.image,
        external_url: entry.externalUrl,
    };
}

async function isMinter(erc721: ERC721Document, address: string) {
    return await erc721.contract.methods.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address).call();
}

async function addMinter(erc721: ERC721Document, address: string) {
    const receipt = await TransactionService.send(
        erc721.address,
        erc721.contract.methods.grantRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address),
        erc721.chainId,
    );

    assertEvent('RoleGranted', parseLogs(erc721.contract.options.jsonInterface, receipt.logs));
}

async function findTokenById(id: string): Promise<ERC721TokenDocument> {
    return ERC721Token.findById(id);
}

async function findTokensByMetadataAndSub(metadataId: string, account: TAccount): Promise<ERC721TokenDocument[]> {
    return ERC721Token.find({ sub: account.sub, metadataId });
}

async function findTokensBySub(sub: string): Promise<ERC721TokenDocument[]> {
    return ERC721Token.find({ sub });
}

async function findTokensByWallet(wallet: WalletDocument): Promise<ERC721TokenDocument[]> {
    return ERC721Token.find({ walletId: wallet._id });
}

async function findMetadataById(id: string): Promise<ERC721MetadataDocument> {
    return ERC721Metadata.findById(id);
}

async function findTokensByRecipient(recipient: string, erc721Id: string): Promise<TERC721Token[]> {
    const result = [];
    for await (const token of ERC721Token.find({ recipient, erc721Id })) {
        const metadata = await ERC721Metadata.findById(token.metadataId);
        result.push({ ...(token.toJSON() as TERC721Token), metadata });
    }
    return result;
}

async function findTokensByMetadata(metadata: ERC721MetadataDocument): Promise<TERC721Token[]> {
    return ERC721Token.find({ metadataId: String(metadata._id) });
}

async function findMetadataByNFT(erc721Id: string, page = 1, limit = 10, q?: string) {
    let query;
    if (q && q != 'null' && q != 'undefined') {
        query = { erc721Id, title: { $regex: `.*${q}.*`, $options: 'i' } };
    } else {
        query = { erc721Id };
    }

    const paginatedResult = await paginatedResults(ERC721Metadata, page, limit, query);

    const results: TERC721Metadata[] = [];
    for (const metadata of paginatedResult.results) {
        const tokens = (await this.findTokensByMetadata(metadata)).map((m: ERC721MetadataDocument) => m.toJSON());
        results.push({ ...metadata.toJSON(), tokens });
    }
    paginatedResult.results = results;
    return paginatedResult;
}

async function findByQuery(query: { poolAddress?: string; address?: string; chainId?: ChainId }) {
    return ERC721.findOne(query);
}

export const update = (erc721: ERC721Document, updates: IERC721Updates) => {
    return ERC721.findByIdAndUpdate(erc721._id, updates, { new: true });
};

export const getOnChainERC721Token = async (chainId: number, address: string) => {
    const contract = getContractFromName(chainId, 'NonFungibleToken', address);

    const [name, symbol, totalSupply] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
    ]);

    return { name, symbol, totalSupply };
};

export async function transferFromWallet(
    erc721: ERC721Document,
    erc721Token: ERC721TokenDocument,
    wallet: WalletDocument,
    to: string,
): Promise<TransactionDocument> {
    const tx = await TransactionService.sendSafeAsync(
        wallet,
        erc721.address,
        erc721.contract.methods.transferFrom(wallet.address, to, erc721Token.tokenId),
        {
            type: 'erc721TransferFromWalletCallback',
            args: {
                erc721Id: String(erc721._id),
                erc721TokenId: String(erc721Token._id),
                walletId: String(wallet._id),
                to,
            },
        },
    );

    await erc721Token.updateOne({ transactions: [tx._id] });

    return tx;
}

export async function transferFromWalletCallback(
    args: TERC721TransferFromWalletCallbackArgs,
    receipt: TransactionReceipt,
) {
    const { erc721Id, erc721TokenId, to } = args;
    const { contract } = await ERC721.findById(erc721Id);
    const { tokenId } = await ERC721Token.findById(erc721TokenId);
    const ownerOfToken = await contract.methods.ownerOf(tokenId).call();

    if (receipt) {
        // TODO Parse events and assert instead of manual assertion
    }

    const toWallet = await WalletService.findOneByAddress(to);
    await ERC721Token.findByIdAndUpdate(erc721TokenId, {
        state: ERC721TokenState.Transferred,
        recipient: toChecksumAddress(ownerOfToken),
        sub: toWallet ? toWallet.sub : '',
        walletId: toWallet ? String(toWallet._id) : '',
    });
}

export async function transferFrom(
    pool: AssetPoolDocument,
    erc721Token: ERC721TokenDocument,
    erc721: ERC721Document,
    wallet: WalletDocument,
    forceSync = true,
): Promise<ERC721TokenDocument> {
    const txId = await TransactionService.sendAsync(
        pool.contract.options.address,
        pool.contract.methods.transferFromERC721(wallet.address, erc721Token.tokenId, erc721.address),
        pool.chainId,
        forceSync,
        {
            type: 'erc721nTransferFromCallback',
            args: {
                erc721Id: String(erc721._id),
                erc721TokenId: String(erc721Token._id),
                sub: wallet.sub,
                assetPoolId: String(pool._id),
            },
        },
    );

    return ERC721Token.findByIdAndUpdate(erc721Token._id, { transactions: [txId] });
}

export async function transferFromCallback(args: TERC721TransferFromCallBackArgs, receipt: TransactionReceipt) {
    const { assetPoolId, erc721TokenId, sub } = args;
    const { contract, chainId } = await PoolService.getById(assetPoolId);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);
    const event = assertEvent('ERC721Transferred', events);
    const wallet = await WalletService.findPrimary(sub, chainId);

    await ERC721Token.findByIdAndUpdate(erc721TokenId, {
        sub,
        state: ERC721TokenState.Transferred,
        tokenId: Number(event.args.tokenId),
        recipient: event.args.to,
        walletId: wallet && String(wallet._id),
    });
}

export async function queryTransferFromTransaction(erc721Token: ERC721TokenDocument): Promise<ERC721TokenDocument> {
    if (erc721Token.state === ERC721TokenState.Transferring) {
        const tx = await Transaction.findById(erc721Token.transactions[erc721Token.transactions.length - 1]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc721Token = await findTokenById(erc721Token._id);
        }
    }

    return erc721Token;
}

async function migrate(fromWallet: WalletDocument, toWallet: WalletDocument, erc721TokenId: string) {
    const token = await ERC721Token.findById(erc721TokenId);
    if (token.recipient == toWallet.address) return;

    const erc721 = await ERC721.findById(token.erc721Id);
    if (!erc721) return;

    await TransactionService.sendAsync(
        fromWallet.contract.options.address,
        fromWallet.contract.methods.transferERC721(erc721.address, toWallet.address, token.tokenId),
        fromWallet.chainId,
        true,
        {
            type: 'erc721TransferFromWalletCallback',
            args: {
                erc721Id: String(erc721._id),
                erc721TokenId,
                walletId: String(fromWallet._id),
                to: toWallet.address,
            },
        },
    );
}

export default {
    migrate,
    deploy,
    deployCallback,
    findById,
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
    parseAttributes,
    update,
    initialize,
    queryDeployTransaction,
    getOnChainERC721Token,
    transferFrom,
    transferFromCallback,
    transferFromWallet,
    transferFromWalletCallback,
    queryTransferFromTransaction,
    findTokensByWallet,
};
