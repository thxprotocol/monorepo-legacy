import Web3 from 'web3';
import CustomAuth, { CustomAuthArgs } from '@toruslabs/customauth';
import { TORUS_NETWORK, ROPSTEN_RPC } from './secrets';

export function mockPrivateKeyForSubject(subject: string) {
    const pkey = localStorage.getItem(`mock:privateKey:${subject}`);
    if (pkey) return pkey;

    const account = new Web3().eth.accounts.create();
    localStorage.setItem(`mock:privateKey:${subject}`, account.privateKey);
    console.log(account.privateKey);
    return account.privateKey;
}

const options: CustomAuthArgs = {
    baseUrl: `${location.origin}/serviceworker`,
    enableLogging: TORUS_NETWORK !== 'mainnet',
    network: TORUS_NETWORK as any,
};
if (TORUS_NETWORK === 'testnet' && ROPSTEN_RPC) {
    options.networkUrl = ROPSTEN_RPC;
}
export const torusClient = new CustomAuth(options);
