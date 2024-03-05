import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class QRCodeManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    get(uuid: string) {
        return this.client.request.get(`/v1/qr-codes/${uuid}`);
    }

    entry = {
        create: (uuid: string) => {
            return this.client.request.post(`/v1/qr-codes/${uuid}/entries`);
        },
    };
}

export default QRCodeManager;
