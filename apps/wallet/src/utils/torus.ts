import Web3 from 'web3';
import CustomAuth, { TORUS_NETWORK_TYPE } from '@toruslabs/customauth';
import { TORUS_NETWORK } from './secrets';

export function mockPrivateKeyForSubject(subject: string) {
    const pkey = localStorage.getItem(`mock:privateKey:${subject}`);
    if (pkey) return pkey;

    const account = new Web3().eth.accounts.create();
    localStorage.setItem(`mock:privateKey:${subject}`, account.privateKey);

    return account.privateKey;
}

export const torusClient = new CustomAuth({
    baseUrl: `${location.origin}/serviceworker`,
    enableLogging: false,
    network: (TORUS_NETWORK as unknown) as TORUS_NETWORK_TYPE,
});
