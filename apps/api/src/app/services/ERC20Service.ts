import ERC20, { ERC20Document, IERC20Updates } from '@thxnetwork/api/models/ERC20';
import { toChecksumAddress, toWei } from 'web3-utils';
import { ICreateERC20Params } from '@thxnetwork/api/types/interfaces';
import TransactionService from './TransactionService';
import { assertEvent, ExpectedEventNotFound, findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { ChainId, ERC20Type, TransactionState } from '@thxnetwork/types/enums';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { getByteCodeForContractName, getContractFromName } from '@thxnetwork/api/services/ContractService';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import { getProvider } from '@thxnetwork/api/util/network';
import { TransactionReceipt } from 'web3-eth-accounts/node_modules/web3-core';
import { TERC20DeployCallbackArgs, TERC20TransferFromCallBackArgs } from '@thxnetwork/api/types/TTransaction';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import ERC20Transfer from '../models/ERC20Transfer';
import { WalletDocument } from '../models/Wallet';
import { TokenContractName } from '@thxnetwork/contracts/exports';
import BN from 'bn.js';
import { ERC20Perk } from '../models/ERC20Perk';
import SafeService, { Wallet } from './SafeService';
import PoolService from './PoolService';
import { TWallet } from '@thxnetwork/common/lib/types';

function getDeployArgs(erc20: ERC20Document, totalSupply?: string) {
    const { defaultAccount } = getProvider(erc20.chainId);

    switch (erc20.type) {
        case ERC20Type.Limited: {
            return [erc20.name, erc20.symbol, defaultAccount, totalSupply];
        }
        case ERC20Type.Unlimited: {
            return [erc20.name, erc20.symbol, defaultAccount];
        }
    }
}

export async function findBySub(sub: string) {
    const pools = await PoolService.getAllBySub(sub);
    const coinRewards = await ERC20Perk.find({ poolId: pools.map((p) => String(p._id)) });
    const erc20Ids = coinRewards.map((c) => c.erc20Id);
    const erc20s = await ERC20.find({ sub });

    return erc20s.concat(await ERC20.find({ _id: erc20Ids }));
}

export const deploy = async (params: ICreateERC20Params, forceSync = true) => {
    const erc20 = await ERC20.create({
        name: params.name,
        symbol: params.symbol,
        chainId: params.chainId,
        type: params.type,
        sub: params.sub,
        logoImgUrl: params.logoImgUrl,
    });

    const contract = getContractFromName(params.chainId, erc20.contractName as TokenContractName);
    const bytecode = getByteCodeForContractName(erc20.contractName as TokenContractName);

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
    const contract = getContractFromName(erc20.chainId, erc20.contractName as TokenContractName);
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
        await addMinter(erc20, pool.safeAddress);
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

const addToken = async (wallet: WalletDocument, erc20: ERC20Document) => {
    const query = { sub: wallet.sub, walletId: wallet.id, erc20Id: erc20._id };
    if (!(await ERC20Token.exists(query))) {
        await createERC20Token(erc20, wallet);
    }
};

export const getAll = (sub: string) => {
    return ERC20.find({ sub });
};

export const getTokensForSub = (sub: string) => {
    return ERC20Token.find({ sub });
};

export const getTokensForWallet = (wallet: WalletDocument) => {
    return ERC20Token.find({ walletId: wallet.id });
};

export const getById = async (id: string) => {
    const erc20 = await ERC20.findById(id);
    if (!erc20) return;

    erc20.logoImgUrl = erc20.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${erc20.address}`;
    return erc20;
};

export const getTokenById = (id: string) => {
    return ERC20Token.findById(id);
};

export const findBy = (query: { address: string; chainId: ChainId; sub?: string }) => {
    return ERC20.findOne(query);
};

export const addTokenForWallet = async (erc20: ERC20Document, wallet: WalletDocument) => {
    const hasToken = await ERC20Token.exists({
        sub: wallet.sub,
        walletId: wallet.id,
        erc20Id: erc20.id,
    });

    if (!hasToken) {
        await createERC20Token(erc20, wallet);
    }
};

export const importToken = async (chainId: number, address: string, wallet: WalletDocument, logoImgUrl: string) => {
    const contract = getContractFromName(chainId, 'LimitedSupplyToken', address);
    const [name, symbol] = await Promise.all([contract.methods.name().call(), contract.methods.symbol().call()]);
    const erc20 = await ERC20.create({
        name,
        symbol,
        address: toChecksumAddress(address),
        chainId,
        type: ERC20Type.Unknown,
        sub: wallet.sub,
        logoImgUrl,
    });

    await addTokenForWallet(erc20, wallet);

    return erc20;
};

export const update = (erc20: ERC20Document, updates: IERC20Updates) => {
    return ERC20.findByIdAndUpdate(erc20._id, updates, { new: true });
};

export const approve = async (erc20: ERC20Document, wallet: WalletDocument, amountInWei: string) => {
    return await TransactionService.sendSafeAsync(
        wallet,
        erc20.address,
        erc20.contract.methods.approve(wallet.address, amountInWei),
    );
};

export const transferFrom = async (erc20: ERC20Document, wallet: WalletDocument, to: string, amountInWei: string) => {
    const erc20Transfer = await ERC20Transfer.create({
        erc20Id: erc20._id,
        from: wallet.address,
        to,
        amount: amountInWei,
        chainId: wallet.chainId,
        sub: wallet.sub,
    });

    // Check if an erc20Token exists for a known receiving wallet and create one if not
    const toWallet = await Wallet.findOne({ chainId: wallet.chainId, address: toChecksumAddress(to) });
    if (toWallet && !(await ERC20Token.exists({ walletId: toWallet._id, erc20Id: erc20._id }))) {
        await createERC20Token(erc20, toWallet);
    }

    const tx = await TransactionService.sendSafeAsync(
        wallet,
        erc20.address,
        erc20.contract.methods.transfer(to, amountInWei),
        { type: 'transferFromCallBack', args: { erc20Id: String(erc20._id) } },
    );

    await erc20Transfer.updateOne({ transactionId: String(tx._id) });

    return tx;
};

export const transferFromCallBack = async (args: TERC20TransferFromCallBackArgs, receipt: TransactionReceipt) => {
    const erc20 = await ERC20.findById(args.erc20Id);
    const events = parseLogs(erc20.contract.options.jsonInterface, receipt.logs);

    assertEvent('ERC20ProxyTransferFrom', events);
};

async function isMinter(erc20: ERC20Document, address: string) {
    return await erc20.contract.methods.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address).call();
}

async function createERC20Token(erc20: ERC20Document, wallet: TWallet) {
    await ERC20Token.create({
        sub: wallet.sub,
        walletId: String(wallet._id),
        erc20Id: String(erc20._id),
    });
}

export default {
    findBySub,
    createERC20Token,
    deploy,
    getAll,
    findBy,
    getById,
    addToken,
    addMinter,
    isMinter,
    importToken,
    getTokensForSub,
    getTokenById,
    update,
    initialize,
    queryDeployTransaction,
    transferFrom,
    transferFromCallBack,
    getTokensForWallet,
    approve,
};
