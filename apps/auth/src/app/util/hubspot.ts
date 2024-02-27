import * as Hubspot from '@hubspot/api-client';
import { HUBSPOT_ACCESS_TOKEN, NODE_ENV } from '../config/secrets';
import { PublicObjectSearchRequest } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { AccountPlanType, Goal, Role } from '@thxnetwork/common/enums';
import { roleLabelMap, goalLabelMap } from '@thxnetwork/types/contants';

const hubspotClient = new Hubspot.Client({ accessToken: HUBSPOT_ACCESS_TOKEN });

export const hubspot = {
    // Process account information for upsert into Hubspot
    async upsert(props: {
        firstname?: string;
        lastname?: string;
        email: string;
        company?: string;
        website?: string;
        plan?: AccountPlanType;
        role?: Role;
        goals?: Goal[];
    }) {
        if (!HUBSPOT_ACCESS_TOKEN || NODE_ENV !== 'production') return;

        try {
            // Always return when no props or no email is provided
            if (!props || !props.email) return;

            const { contact, associatedCompanyId } = await this.upsertContact(props);

            // If company or website are provided
            if (props.company || props.website) {
                const company = await this.upsertCompany(props, associatedCompanyId);

                // Associate company with contact
                await hubspotClient.crm.companies.associationsApi.create(company.id, 'contacts', contact.id, [
                    {
                        associationCategory: 'HUBSPOT_DEFINED',
                        associationTypeId: 280,
                    },
                ]);
            }
        } catch (error) {
            console.log(error);
        }
    },

    // Upsert new company into Hubspot
    async upsertCompany(props, associatedCompanyId?: string) {
        const companyObj = {
            properties: {
                domain: props.website,
                name: props.company,
            },
        };

        let company = await this.findCompany(props);

        // If an associatedCompanyId is set for the contact update the associated company
        if (associatedCompanyId) {
            company = await hubspotClient.crm.companies.basicApi.update(associatedCompanyId, companyObj);
        }
        // If a company is found for the submitted company details update this company
        else if (company) {
            company = await hubspotClient.crm.companies.basicApi.update(company.id, companyObj);
        }
        // If no associatedCompanyId is set or company details are found create a new company
        else {
            company = await hubspotClient.crm.companies.basicApi.create(companyObj);
        }

        return company;
    },

    // Upsert new contact into Hubspot
    async upsertContact(props) {
        let associatedCompanyId,
            contact = await this.findContact(props);

        const contactObj = {
            properties: {
                firstname: props.firstname,
                lastname: props.lastname,
                email: props.email,
                signup: 'true',
                plan: AccountPlanType[props.plan],
                role: props.role ? roleLabelMap[props.role] : '',
                goal: props.goals.length ? JSON.stringify(props.goals.map((goal) => goalLabelMap[goal])) : '',
            },
        };

        // If a contact is found for the submitted props then update the contact in the CRM
        if (contact) {
            associatedCompanyId = contact.properties.associatedCompanyId;
            contact = await hubspotClient.crm.contacts.basicApi.update(contact.id, contactObj);
        }
        // If a contact is not found for the submitted props then create a contact
        else {
            contact = await hubspotClient.crm.contacts.basicApi.create(contactObj);
        }
        return { contact, associatedCompanyId };
    },

    // Find new contact in Hubspot if any
    async findContact(props: { email: string; firstname: string; lastname: string }) {
        const filters = [{ propertyName: 'email', operator: 'EQ', value: props.email }];
        const publicObjectSearchRequest = {
            filterGroups: [{ filters }],
            properties: ['firstname', 'lastname', 'email', 'plan', 'role', 'goal', 'associatedCompanyId'],
            limit: 1,
        } as PublicObjectSearchRequest;

        const { results } = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);
        if (!results.length) return;

        return results[0];
    },

    // Find new company in Hubspot if any
    async findCompany(props: { website: string }) {
        if (!props.website) return;

        const filters = [{ propertyName: 'domain', operator: 'EQ', value: props.website }];
        const { results } = await hubspotClient.crm.companies.searchApi.doSearch({
            filterGroups: [{ filters }],
            properties: ['name', 'domain'],
            limit: 1,
        } as PublicObjectSearchRequest);

        return results[0];
    },
};
