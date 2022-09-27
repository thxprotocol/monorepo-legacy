import ERC20, { ERC20Document, IERC20Updates } from '@thxnetwork/api/models/ERC20';
import { toWei } from 'web3-utils';
import { ICreateERC20Params } from '@thxnetwork/api/types/interfaces';
import TransactionService from './TransactionService';
import { assertEvent, parseLogs } from '@thxnetwork/api/util/events';
import { ChainId, ERC20Type } from '@thxnetwork/api/types/enums';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { TokenContractName } from '@thxnetwork/artifacts';
import { getAbiForContractName, getByteCodeForContractName, getContractFromName } from '@thxnetwork/api/config/contracts';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { ERC20Token } from '@thxnetwork/api/models/ERC20Token';
import { getProvider } from '@thxnetwork/api/util/network';
import MembershipService from './MembershipService';

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

export const deploy = async (contractName: TokenContractName, params: ICreateERC20Params) => {
    const erc20 = await ERC20.create({
        name: params.name,
        symbol: params.symbol,
        chainId: params.chainId,
        type: params.type,
        sub: params.sub,
        archived: false,
        logoImgUrl: params.logoImgUrl,
    });

    const contract = await TransactionService.deploy(
        getAbiForContractName(contractName),
        getByteCodeForContractName(contractName),
        getDeployArgs(erc20, params.totalSupply),
        erc20.chainId,
    );

    erc20.address = contract.options.address;

    return await erc20.save();
};

const initialize = async (pool: AssetPoolDocument, address: string) => {
    const erc20 = await findBy({ chainId: pool.chainId, address, sub: pool.sub });
    if (erc20 && erc20.type === ERC20Type.Unlimited) {
        await addMinter(erc20, pool.address);
    }
    await MembershipService.addERC20Membership(pool.sub, pool);
};

const addMinter = async (erc20: ERC20Document, address: string) => {
    const receipt = await TransactionService.send(
        erc20.address,
        erc20.contract.methods.grantRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address),
        erc20.chainId,
    );

    assertEvent('RoleGranted', parseLogs(erc20.contract.options.jsonInterface, receipt.logs));
};

export const getAll = (sub: string) => {
    return ERC20.find({ sub });
};

export const getTokensForSub = (sub: string) => {
    return ERC20Token.find({ sub });
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

    // Create an ERC20Token object for the sub if it does not exist
    if (
        !(await ERC20Token.exists({
            sub: erc20.sub,
            erc20Id: String(erc20._id),
        }))
    ) {
        await ERC20Token.create({
            sub: erc20.sub,
            erc20Id: String(erc20._id),
        });
    }

    return erc20;
};

export const importERC20Token = async (chainId: number, address: string, sub: string, logoImgUrl: string) => {
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
    });

    // Create an ERC20Token object for the sub if it does not exist
    if (
        !(await ERC20Token.exists({
            sub: erc20.sub,
            erc20Id: String(erc20._id),
        }))
    ) {
        await ERC20Token.create({
            sub: erc20.sub,
            erc20Id: String(erc20._id),
        });
    }

    return erc20;
};

export const findByPool = async (assetPool: AssetPoolDocument): Promise<ERC20Document> => {
    const address = await assetPool.contract.methods.getERC20().call();
    return await findOrImport(assetPool, address);
};

export const removeById = (id: string) => {
    return ERC20.deleteOne({ _id: id });
};

export const update = (erc20: ERC20Document, updates: IERC20Updates) => {
    return ERC20.findByIdAndUpdate(erc20._id, updates, { new: true });
};

export default {
    deploy,
    getAll,
    findBy,
    findByPool,
    getById,
    removeById,
    addMinter,
    findOrImport,
    importERC20Token,
    getTokensForSub,
    getTokenById,
    update,
    initialize,
};
