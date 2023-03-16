<template>
    <b-card class="shadow-sm mb-2">
        <b-row>
            <b-col md="3">
                <b-form-group class="w-100" label="Client Name" label-class="text-gray">
                    {{ client.name }}
                </b-form-group>
            </b-col>
            <b-col md="3">
                <b-form-group class="w-100" label="Grant Type" label-class="text-gray">
                    {{ client.grantType }}
                </b-form-group>
            </b-col>
            <b-col md="5">
                <b-form-row>
                    <b-col md="3">
                        <label class="text-gray">Client ID</label>
                    </b-col>
                    <b-col>
                        <b-input-group size="sm" class="mb-2">
                            <b-form-input readonly size="sm" :value="client.clientId" />
                            <template #append>
                                <b-button size="sm" variant="dark" v-clipboard:copy="client.clientId">
                                    <i class="fas fa-clipboard m-0"></i>
                                </b-button>
                            </template>
                        </b-input-group>
                    </b-col>
                </b-form-row>
                <b-form-row>
                    <b-col md="3">
                        <label class="text-gray">Client Secret</label>
                    </b-col>
                    <b-col>
                        <b-input-group size="sm">
                            <b-form-input readonly size="sm" :value="clientSecret" />

                            <template #append>
                                <b-button size="sm" variant="dark" v-clipboard:copy="client.clientSecret">
                                    <i class="fas fa-clipboard m-0"></i>
                                </b-button>
                            </template>
                        </b-input-group>
                    </b-col>
                </b-form-row>
            </b-col>
            <b-col md="1">
                <b-dropdown class="float-right" size="sm" variant="white" no-caret right>
                    <template #button-content>
                        <i
                            class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted"
                            style="font-size: 1.2rem"
                            aria-hidden="true"
                        ></i>
                    </template>
                    <b-dropdown-item @click="onEdit"> <i class="fas fa-pen mr-2"></i> Edit </b-dropdown-item>
                </b-dropdown>
            </b-col>
        </b-row>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TClient } from '@thxnetwork/dashboard/store/modules/clients';
import type { TPool } from '@thxnetwork/dashboard/store/modules/pools';

export interface TClientInfo {
    clientId: string;
    clientSecret: string;
    requestUris: string[];
}

@Component({})
export default class BaseListItemClient extends Vue {
    @Prop() client!: TClient;
    @Prop() pool!: TPool;

    editingClient: TClient | undefined;

    get clientSecret() {
        return (
            this.client.clientSecret &&
            Array.from({ length: this.client.clientSecret.length })
                .map(() => '•')
                .join('')
        );
    }

    onEdit() {
        this.$emit('edit', this.client);
    }

    async mounted() {
        await this.$store.dispatch('clients/get', {
            client: this.client,
            pool: this.pool,
        });
    }
}
</script>
