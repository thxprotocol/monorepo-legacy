import * as Hubspot from '@hubspot/api-client';
import { HUBSPOT_ACCESS_TOKEN } from '../config/secrets';
import { PublicObjectSearchRequest } from '@hubspot/api-client/lib/codegen/crm/contacts';

const hubspotClient = new Hubspot.Client({ accessToken: HUBSPOT_ACCESS_TOKEN });

export const hubspot = {
    async upsert(email: string) {
        const filter = { propertyName: 'email', operator: 'EQ', value: email };
        const filterGroup = { filters: [filter] };
        const properties = ['firstname', 'lastname', 'email'];
        const limit = 1;
        const publicObjectSearchRequest = {
            filterGroups: [filterGroup],
            properties,
            limit,
        } as PublicObjectSearchRequest;

        const { results } = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);

        if (results.length) {
            const contactInfo = results[0].properties;
            console.log(contactInfo);
        }
    },
};
