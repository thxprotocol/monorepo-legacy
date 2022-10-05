import Web3 from 'web3';
import { isAddress } from 'web3-utils';
import { soliditySha3 } from 'web3-utils';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/LimitedSupplyToken.json';
import { default as defaultPoolDiamondAbi } from '@thxnetwork/artifacts/dist/exports/abis/defaultDiamondDiamond.json';

export const MINIMUM_GAS_LIMIT = 54680;
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

export async function signCall(web3: Web3, poolAddress: string, name: string, params: any[], privateKey: string) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const solution = new web3.eth.Contract(defaultPoolDiamondAbi as any, poolAddress, {
        from: account.address,
    });
    const abi: any = defaultPoolDiamondAbi.find((fn: any) => fn.name === name);
    const nonce = Number(await solution.methods.getLatestNonce(account.address).call()) + 1;
    const call = web3.eth.abi.encodeFunctionCall(abi, params);
    const hash = soliditySha3(call, nonce) || '';
    const sig = web3.eth.accounts.sign(hash, account.privateKey).signature;

    return {
        call,
        nonce,
        sig,
    };
}

export async function send(web3: Web3, to: string, fn: any, privateKey: string) {
    const gasPrice = await web3.eth.getGasPrice();
    const [from] = await web3.eth.getAccounts();
    const data = fn.encodeABI();
    const estimate = await fn.estimateGas();
    const gas = estimate < MINIMUM_GAS_LIMIT ? MINIMUM_GAS_LIMIT : estimate;
    const sig = await web3.eth.accounts.signTransaction(
        {
            gas,
            maxPriorityFeePerGas: gasPrice,
            to,
            from,
            data,
        },
        privateKey,
    );

    if (sig.rawTransaction) {
        return await web3.eth.sendSignedTransaction(sig.rawTransaction);
    }
}

export function getERC20Contract(web3: Web3, address: string) {
    return new web3.eth.Contract(ERC20Abi as any, address);
}

export function getAssetPoolContract(web3: Web3, address: string) {
    return new web3.eth.Contract(defaultPoolDiamondAbi as any, address);
}

export function isValidKey(privateKey: string) {
    try {
        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);

        return isAddress(account.address);
    } catch (e) {
        return false;
    }
}

export function isPrivateKey(privateKey: string) {
    try {
        if (!privateKey.startsWith('0x')) {
            throw new Error('Private key does not start with 0x');
        }
        if (privateKey.length !== 66) {
            throw new Error('Private key string lenght is not 66.');
        }

        return isValidKey(privateKey);
    } catch (e) {
        console.log(e);
        return false;
    }
}
