import { THXClient } from '../../index';
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
        if (event.length > 0 && event.length <= 10) {
            throw new Error("Please provide an 'event' with a string length of min 0 and max 10.");
        }
        if (!identity) {
            throw new Error("Please provide an 'identity' parameter. Create it with 'client.identity.create()'.");
        }
        if (!this.client.options.apiKey) {
            throw new Error(
                "Please provide an 'apiKey' when constructing the client or set it with 'client.setApiKey('...')'.",
            );
        }

        await this.client.request.post('/v1/events', {
            body: JSON.stringify({ event, identityUuid: identity, token: this.client.options.apiKey }),
        });
    }
}

export default EventManager;
