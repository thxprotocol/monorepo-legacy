<template>
    <b-form-row>
        <b-col md="4">
            <strong>THX ID</strong>
            <p class="text-muted">Use THX ID to connect your users to accounts.</p>
            <BaseCode :codes="[code]" :languages="['JavaScript']" />
        </b-col>
        <b-col md="8">
            <b-form-group label="Identities">
                <BTable :items="identities" hover show-empty responsive="lg">
                    <!-- Head formatting -->
                    <template #head(uuid)>Code</template>
                    <template #head(sub)> Account ID </template>
                    <template #head(createdAt)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(uuid)="{ item }">
                        <code>{{ item.uuid }}</code>
                    </template>
                    <template #cell(sub)="{ item }">
                        <span>{{ item.account ? item.account.username : item.sub }}</span>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">
                            {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </small>
                    </template>
                </BTable>
            </b-form-group>
        </b-col>
    </b-form-row>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { format } from 'date-fns';
import BaseCode from '@thxnetwork/dashboard/components/BaseCode.vue';

const exampleCode = `const identity = await thx.identity.create();
// 36d33a59-5398-463a-ac98-0f7d9b201648

const identity = await thx.identity.get("a unique string");
// Will always return 36d33a59-5398-463a-ac98-0f7d9b201648
`;

@Component({
    components: { BaseCode },
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class IdentitiesView extends Vue {
    format = format;
    pools!: IPools;
    isCopied = false;
    code = exampleCode;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get identities() {
        if (!this.pool || !this.pool.identities) return [];
        return this.pool.identities.map((identity) => ({
            uuid: identity.uuid,
            sub: identity.sub,
            createdAt: identity.createdAt,
        }));
    }
}
</script>
