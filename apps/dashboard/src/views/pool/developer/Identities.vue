<template>
    <b-form-row>
        <b-col md="4">
            <strong>THX ID</strong>
            <p class="text-muted">Use THX identities to connect your users to THX accounts.</p>
            <BaseCode :codes="[code]" :languages="['JavaScript']" />
        </b-col>
        <b-col md="8">
            <b-form-group>
                <b-button @click="onClickCreate" variant="primary" size="sm" class="rounded-pill float-right">
                    <b-spinner v-if="isLoadingCreate" small />
                    <i v-else class="fas fa-plus mx-1" /> New Identity
                </b-button>
            </b-form-group>
            <b-form-group label="Identities">
                <BTable :items="identities" hover show-empty responsive="lg">
                    <!-- Head formatting -->
                    <template #head(uuid)>Code</template>
                    <template #head(participant)> Participant </template>
                    <template #head(createdAt)> Created </template>
                    <template #head(identity)> </template>

                    <!-- Cell formatting -->
                    <template #cell(uuid)="{ item }">
                        <code>{{ item.uuid }}</code>
                    </template>
                    <template #cell(participant)="{ item }">
                        <BaseParticipantAccount v-if="item.participant" :account="item.participant" />
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">
                            {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </small>
                    </template>
                    <template #cell(identity)="{ item }">
                        <b-dropdown variant="link" size="sm" right no-caret>
                            <template #button-content>
                                <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                            </template>
                            <b-dropdown-item @click="onClickDelete(item.identity)"> Delete </b-dropdown-item>
                        </b-dropdown>
                    </template>
                </BTable>
            </b-form-group>
            <div class="d-flex">
                <b-pagination
                    v-if="identitiesList[pool._id]"
                    @change="onChangePage"
                    v-model="page"
                    first-number
                    last-number
                    class="mx-auto"
                    size="sm"
                    :total-rows="identitiesList[pool._id].total"
                    :per-page="limit"
                />
            </div>
        </b-col>
    </b-form-row>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools, TIdentityState } from '@thxnetwork/dashboard/store/modules/pools';
import { format } from 'date-fns';
import BaseCode from '@thxnetwork/dashboard/components/BaseCode.vue';
import { TIdentity } from '@thxnetwork/common/lib/types/interfaces/Identity';
import BaseParticipantAccount, { parseAccount } from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';

const exampleCode = `const identity = await thx.identity.create();
// 36d33a59-5398-463a-ac98-0f7d9b201648

const identity = await thx.identity.get("a unique string");
// Will always return 36d33a59-5398-463a-ac98-0f7d9b201648
`;

@Component({
    components: { BaseCode, BaseParticipantAccount },
    computed: mapGetters({
        pools: 'pools/all',
        identitiesList: 'pools/identities',
    }),
})
export default class IdentitiesView extends Vue {
    format = format;
    pools!: IPools;
    isCopied = false;
    code = exampleCode;
    identitiesList!: TIdentityState;
    isLoadingList = false;
    isLoadingCreate = false;
    isLoadingRemove = false;
    page = 1;
    limit = 10;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get identities() {
        if (!this.identitiesList[this.pool._id]) return [];
        return this.identitiesList[this.pool._id].results.map((identity) => ({
            uuid: identity.uuid,
            participant: parseAccount({ id: identity.sub, account: identity.account }),
            createdAt: identity.createdAt,
            identity,
        }));
    }

    mounted() {
        this.listIdentities();
    }

    async listIdentities() {
        this.isLoadingList = true;
        await this.$store.dispatch('pools/listIdentities', { pool: this.pool, limit: this.limit, page: this.page });
        this.isLoadingList = false;
    }

    async onClickCreate() {
        this.isLoadingCreate = true;
        await this.$store.dispatch('pools/createIdentity', this.pool);
        this.listIdentities();
        this.isLoadingCreate = false;
    }

    onClickDelete(identity: TIdentity) {
        this.$store.dispatch('pools/removeIdentity', identity);
    }

    onChangePage(page: number) {
        this.page = page;
        this.listIdentities();
    }
}
</script>
