import {
    HARDHAT_NAME,
    HARDHAT_RPC,
    MUMBAI_RELAYER,
    MUMBAI_RELAYER_API_KEY,
    MUMBAI_RELAYER_API_SECRET,
    POLYGON_MUMBAI_NAME,
    POLYGON_MUMBAI_RPC,
    POLYGON_RELAYER,
    POLYGON_RELAYER_API_KEY,
    POLYGON_RELAYER_API_SECRET,
    POLYGON_RPC,
    PRIVATE_KEY,
    RELAYER_SPEED,
    POLYGON_NAME,
} from '@thxnetwork/api/config/secrets';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'ethers/lib/utils';
import { ChainId } from '../types/enums';
import { DefenderRelayProvider } from 'defender-relay-client/lib/web3';
import { Relayer } from 'defender-relay-client';
import { TNetworkName } from '@thxnetwork/contracts/exports';

const web3 = new Web3();
const networks: {
    [chainId: number]: {
        web3: Web3;
        networkName: TNetworkName;
        readProvider: Web3;
        defaultAccount: string;
        relayer?: Relayer;
    };
} = {};

if (HARDHAT_RPC) {
    networks[ChainId.Hardhat] = (() => {
        const web3 = new Web3(HARDHAT_RPC);
        return {
            web3,
            networkName: HARDHAT_NAME as TNetworkName,
            defaultAccount: web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY).address,
            readProvider: web3,
        };
    })();
}

if (MUMBAI_RELAYER) {
    networks[ChainId.PolygonMumbai] = (() => {
        const provider = new DefenderRelayProvider(
            { apiKey: MUMBAI_RELAYER_API_KEY, apiSecret: MUMBAI_RELAYER_API_SECRET },
            { speed: RELAYER_SPEED },
        );
        const relayer = new Relayer({ apiKey: MUMBAI_RELAYER_API_KEY, apiSecret: MUMBAI_RELAYER_API_SECRET });
        const readProvider = new Web3(POLYGON_MUMBAI_RPC);
        return {
            web3: new Web3(provider),
            networkName: POLYGON_MUMBAI_NAME as TNetworkName,
            relayer,
            defaultAccount: MUMBAI_RELAYER,
            readProvider,
        };
    })();
}

if (POLYGON_RELAYER) {
    networks[ChainId.Polygon] = (() => {
        const provider = new DefenderRelayProvider(
            { apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET },
            { speed: RELAYER_SPEED },
        );
        const relayer = new Relayer({ apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET });
        const readProvider = new Web3(POLYGON_RPC);
        return {
            web3: new Web3(provider),
            networkName: POLYGON_NAME as TNetworkName,
            relayer,
            defaultAccount: POLYGON_RELAYER,
            readProvider,
        };
    })();
}

export function getProvider(chainId: ChainId) {
    if (!networks[chainId]) throw new Error(`Network with chainId ${chainId} is not available`);
    return networks[chainId];
}

export const recoverSigner = (message: string, sig: string) => {
    return computeAddress(recoverPublicKey(arrayify(hashMessage(message)), sig));
};

export function getSelectors(contract: Contract) {
    const signatures = [];
    for (const sig of Object.keys(contract.methods)) {
        if (sig.indexOf('(') === -1) continue; // Only add selectors for full function signatures.
        signatures.push(web3.eth.abi.encodeFunctionSignature(sig));
    }
    return signatures;
}
