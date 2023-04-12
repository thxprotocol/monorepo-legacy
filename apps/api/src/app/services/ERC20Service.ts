import ERC20, { ERC20Document, IERC20Updates } from '@thxnetwork/api/models/ERC20';
import { toWei } from 'web3-utils';
import { ICreateERC20Params } from '@thxnetwork/api/types/interfaces';
import TransactionService from './TransactionService';
import { assertEvent, ExpectedEventNotFound, findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { ChainId, ERC20Type, TransactionState } from '@thxnetwork/types/enums';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { getByteCodeForContractName, getContractFromName } from '@thxnetwork/api/config/contracts';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import { getProvider } from '@thxnetwork/api/util/network';
import { TransactionReceipt } from 'web3-core';
import { TERC20DeployCallbackArgs, TERC20TransferFromCallBackArgs } from '@thxnetwork/api/types/TTransaction';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import ERC20Transfer from '../models/ERC20Transfer';
import { TWallet, WalletDocument } from '../models/Wallet';
import WalletService from './WalletService';

function getDeployArgs(erc20: ERC20Document, totalSupply?: string) {
    const { defaultAccount } = getProvider(erc20.chainId);

    switch (erc20.type) {
        case ERC20Type.Limited: {
            return [erc20.name, erc20.symbol, defaultAccount, toWei(String(totalSupply))];
        }
        case ERC20Type.Unlimited: {
            return [erc20.name, erc20.symbol, defaultAccount];
        }
    }
}

export const deploy = async (params: ICreateERC20Params, forceSync = true) => {
    const erc20 = await ERC20.create({
        name: params.name,
        symbol: params.symbol,
        chainId: params.chainId,
        type: params.type,
        sub: params.sub,
        archived: false,
        logoImgUrl: params.logoImgUrl,
    });

    const contract = getContractFromName(params.chainId, erc20.contractName);
    const bytecode = getByteCodeForContractName(erc20.contractName);

    const fn = contract.deploy({
        data: bytecode,
        arguments: getDeployArgs(erc20, params.totalSupply),
    });

    const txId = await TransactionService.sendAsync(null, fn, erc20.chainId, forceSync, {
        type: 'Erc20DeployCallback',
        args: { erc20Id: String(erc20._id) },
    });

    return ERC20.findByIdAndUpdate(erc20._id, { transactions: [txId] }, { new: true });
};

export async function deployCallback({ erc20Id }: TERC20DeployCallbackArgs, receipt: TransactionReceipt) {
    const erc20 = await ERC20.findById(erc20Id);
    const contract = getContractFromName(erc20.chainId, erc20.contractName);
    const events = parseLogs(contract.options.jsonInterface, receipt.logs);

    // Limited and unlimited tokes emit different events. Check if one of the two is emitted.
    if (!findEvent('OwnershipTransferred', events) && !findEvent('Transfer', events)) {
        throw new ExpectedEventNotFound('Transfer or OwnershipTransferred');
    }

    await ERC20.findByIdAndUpdate(erc20Id, {
        address: receipt.contractAddress,
    });
}

export async function queryDeployTransaction(erc20: ERC20Document): Promise<ERC20Document> {
    if (!erc20.address && erc20.transactions[0]) {
        const tx = await Transaction.findById(erc20.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc20 = await getById(erc20._id);
        }
    }

    return erc20;
}

const initialize = async (pool: AssetPoolDocument, erc20: ERC20Document) => {
    if (erc20 && erc20.type === ERC20Type.Unlimited) {
        await addMinter(erc20, pool.address);
    }
};

const addMinter = async (erc20: ERC20Document, address: string) => {
    const receipt = await TransactionService.send(
        erc20.address,
        erc20.contract.methods.grantRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address),
        erc20.chainId,
    );

    assertEvent('RoleGranted', parseLogs(erc20.contract.options.jsonInterface, receipt.logs));
};

const addToken = async (sub: string, erc20: ERC20Document) => {
    const query = { sub, erc20Id: erc20._id };
    if (!(await ERC20Token.exists(query))) {
        await createERC20Token(erc20, sub);
    }
};

export const getAll = (sub: string) => {
    return ERC20.find({ sub });
};

export const getTokensForSub = (sub: string) => {
    return ERC20Token.find({ sub });
};

export const getTokensForWallet = (wallet: TWallet) => {
    return ERC20Token.find({ walletId: wallet._id });
};

export const getById = (id: string) => {
    return ERC20.findById(id);
};

export const getTokenById = (id: string) => {
    return ERC20Token.findById(id);
};

export const findBy = (query: { address: string; chainId: ChainId; sub?: string }) => {
    return ERC20.findOne(query);
};

export const findOrImport = async (pool: AssetPoolDocument, address: string) => {
    let erc20 = await findBy({ chainId: pool.chainId, address, sub: pool.sub });
    if (erc20) return erc20;

    const contract = getContractFromName(pool.chainId, 'LimitedSupplyToken', address);
    const [name, symbol] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
    ]);

    erc20 = await ERC20.create({
        name,
        symbol,
        address,
        chainId: pool.chainId,
        type: ERC20Type.Unknown,
        sub: pool.sub,
        archived: false,
    });

    await pool.updateOne({ erc20Id: erc20._id });
    await addTokenForSub(erc20, pool.sub);

    return erc20;
};

export const addTokenForSub = async (erc20: ERC20Document, sub: string) => {
    const hasToken = await ERC20Token.exists({
        sub,
        erc20Id: String(erc20._id),
    });

    if (!hasToken) {
        await createERC20Token(erc20, sub);
    }
};

export const importToken = async (chainId: number, address: string, sub: string, logoImgUrl: string) => {
    const contract = getContractFromName(chainId, 'LimitedSupplyToken', address);
    const [name, symbol] = await Promise.all([contract.methods.name().call(), contract.methods.symbol().call()]);
    const erc20 = await ERC20.create({
        name,
        symbol,
        address,
        chainId,
        type: ERC20Type.Unknown,
        sub,
        logoImgUrl,
        archived: false,
    });

    await addTokenForSub(erc20, sub);

    return erc20;
};

export const getOnChainERC20Token = async (chainId: number, address: string) => {
    const contract = getContractFromName(chainId, 'LimitedSupplyToken', address);

    const [name, symbol, totalSupply] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
    ]);

    return { name, symbol, totalSupply };
};

export const update = (erc20: ERC20Document, updates: IERC20Updates) => {
    return ERC20.findByIdAndUpdate(erc20._id, updates, { new: true });
};

export const transferFrom = async (
    erc20: ERC20Document,
    wallet: WalletDocument,
    to: string,
    amountInWei: string,
    chainId: ChainId,
    sub: string,
) => {
    const erc20Transfer = await ERC20Transfer.create({
        erc20Id: erc20._id,
        from: wallet.address,
        to,
        amount: amountInWei,
        chainId,
        sub,
    });
    const txId = await TransactionService.sendAsync(
        wallet.address,
        wallet.contract.methods.transferERC20(erc20.address, to, amountInWei),
        chainId,
        true,
        { type: 'transferFromCallBack', args: { erc20Id: String(erc20._id) } },
    );
    return await ERC20Transfer.findByIdAndUpdate(erc20Transfer._id, { transactionId: txId }, { new: true });
};
export const transferFromCallBack = async (args: TERC20TransferFromCallBackArgs, receipt: TransactionReceipt) => {
    const erc20 = await ERC20.findById(args.erc20Id);
    const events = parseLogs(erc20.contract.options.jsonInterface, receipt.logs);

    assertEvent('ERC20ProxyTransferFrom', events);
};

async function isMinter(erc20: ERC20Document, address: string) {
    return await erc20.contract.methods.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address).call();
}

async function createERC20Token(erc20: ERC20Document, sub: string) {
    const wallets = await WalletService.findByQuery({ sub, chainId: erc20.chainId });
    await ERC20Token.create({
        sub,
        erc20Id: String(erc20._id),
        walletId: wallets.length ? String(wallets[0]._id) : undefined,
    });
}

export default {
    deploy,
    getAll,
    findBy,
    getById,
    addToken,
    addMinter,
    isMinter,
    findOrImport,
    importToken,
    getTokensForSub,
    getTokenById,
    update,
    initialize,
    getOnChainERC20Token,
    queryDeployTransaction,
    transferFrom,
    transferFromCallBack,
    getTokensForWallet,
};
