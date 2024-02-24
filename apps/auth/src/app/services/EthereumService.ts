import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'ethers/lib/utils';
import { SignTypedDataVersion, recoverTypedSignature } from '@metamask/eth-sig-util';

export const AUTH_REQUEST_TYPED_MESSAGE =
    "Welcome! Please make sure you have selected your preferred account and sign this message to verify it's ownership.";

export default class EthereumService {
    static createTypedMessage(message: string, app: string, nonce: string) {
        return JSON.stringify({
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                ],
                TypedMessage: [
                    { name: 'message', type: 'string' },
                    { name: 'app', type: 'string' },
                    { name: 'nonce', type: 'string' },
                ],
            },
            domain: {
                name: 'THX Network',
                version: '1',
            },
            primaryType: 'TypedMessage',
            message: {
                message,
                app,
                nonce,
            },
        });
    }

    static recoverAddress(message: string, signature: string) {
        return recoverTypedSignature({
            data: JSON.parse(message),
            signature,
            version: 'V3' as SignTypedDataVersion,
        });
    }

    static recoverSigner(message: string, signature: string) {
        return computeAddress(recoverPublicKey(arrayify(hashMessage(message)), signature));
    }
}
