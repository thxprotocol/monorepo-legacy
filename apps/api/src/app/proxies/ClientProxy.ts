import { INITIAL_ACCESS_TOKEN } from '@thxnetwork/api/config/secrets';
import { Client, ClientDocument, TClient, TClientPayload } from '@thxnetwork/api/models/Client';
import { authClient } from '@thxnetwork/api/util/auth';
import { paginatedResults } from '@thxnetwork/api/util/pagination';

export default class ClientProxy {
    static async getCredentials(client: ClientDocument) {
        const { data } = await authClient({
            method: 'GET',
            url: `/reg/${client.clientId}?access_token=${client.registrationAccessToken}`,
        });

        client.clientSecret = data['client_secret'];
        client.requestUris = data['request_uris'];

        return client;
    }

    static async get(id: string): Promise<TClient> {
        const client = await Client.findById(id);
        return await this.getCredentials(client);
    }

    static async findByClientId(clientId: string): Promise<TClient> {
        const client = await Client.findOne({ clientId });
        return await this.getCredentials(client);
    }

    static async isAllowedOrigin(origin: string) {
        return Client.exists({ origins: origin });
    }

    static async findByQuery(query: { poolId: string }, page = 1, limit = 10) {
        return paginatedResults(Client, page, limit, query);
    }

    static async create(sub: string, poolId: string, payload: TClientPayload, name?: string) {
        const { data } = await authClient({
            method: 'POST',
            url: '/reg',
            headers: {
                Authorization: `Bearer ${INITIAL_ACCESS_TOKEN}`,
            },
            data: payload,
        });

        const client = await Client.create({
            sub,
            name,
            poolId,
            grantType: payload.grant_types[0],
            clientId: data.client_id,
            registrationAccessToken: data.registration_access_token,
        });

        if (payload.request_uris && payload.request_uris.length) {
            const origins = payload.request_uris.map((uri: string) => new URL(uri));
            await client.updateOne({ origins });
        }

        client.clientSecret = data['client_secret'];
        client.requestUris = data['request_uris'];

        return client;
    }

    static async remove(clientId: string) {
        const client = await Client.findOne({ clientId });

        await authClient({
            method: 'DELETE',
            url: `/reg/${client.clientId}?access_token=${client.registrationAccessToken}`,
        });

        return client.deleteOne();
    }

    static async update(clientId: string, updates: TClientUpdatePayload) {
        const client = await Client.findOne({ clientId });
        await client.updateOne(updates);
        return this.getCredentials(client);
    }
}

export type TClientUpdatePayload = Partial<{
    name: string;
}>;
