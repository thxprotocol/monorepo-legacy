import { SignTypedDataVersion, recoverTypedSignature } from '@metamask/eth-sig-util';

export default class EthereumService {
    static recoverAddress(message: string, signature: string) {
        return recoverTypedSignature({
            data: JSON.parse(message),
            signature,
            version: 'V3' as SignTypedDataVersion,
        });
    }
}
