import { THXClient } from '../clients';
import BaseManager from './BaseManager';

class EventManager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async create(options: { event: string; identity: string }) {
        const { event, identity } = options;

        if (!event) {
            throw new Error("Please provide an 'event' parameter.");
        }
        if (event.length > 50) {
            throw new Error("Please provide an 'event' with a string length max 50 characters.");
        }
        if (!identity) {
            throw new Error("Please provide an 'identity' parameter. Create it with 'client.identity.create()'.");
        }

        await this.client.request.post('/v1/events', {
            data: JSON.stringify({ event, identityUuid: identity }),
        });
    }
}

export default EventManager;
