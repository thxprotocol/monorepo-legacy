import Web3 from 'web3';
import { isAddress } from 'web3-utils';

export const MINIMUM_GAS_LIMIT = 54680;
export const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

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
        if (!privateKey.startsWith('0x')) throw new Error('Private key does not start with 0x');
        if (privateKey.length !== 66) throw new Error('Private key string lenght is not 66.');
        return isValidKey(privateKey);
    } catch (e) {
        return false;
    }
}
