<template>
    <b-form-row>
        <b-col md="4">
            <strong>THX ID</strong>
            <p class="text-muted">Use THX ID to connect your users to accounts.</p>
            <BaseCode :code="code" language="js" />
        </b-col>
        <b-col md="8">
            <b-form-group label="Identities">
                <BTable :items="wallets" hover show-empty responsive="lg">
                    <!-- Head formatting -->
                    <template #head(url)>Connect URL</template>
                    <template #head(uuid)>Code</template>
                    <template #head(sub)> Account ID </template>
                    <template #head(createdAt)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(url)="{ item }">
                        <b-button variant="light" v-clipboard:copy="item.url" size="sm" class="mr-3">
                            <i class="fas ml-0 fa-clipboard"></i>
                        </b-button>
                    </template>
                    <template #cell(uuid)="{ item }">
                        <code>{{ item.uuid }}</code>
                    </template>
                    <template #cell(sub)="{ item }">
                        <span>{{ item.sub }}</span>
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

const exampleCode = `const thxId = await thx.identity.create();
console.log(thxId); 
// 36d33a59-5398-463a-ac98-0f7d9b201648
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

    get wallets() {
        if (!this.pool || !this.pool.wallets) return [];
        return this.pool.wallets.map((wallet) => ({
            url: this.pool.widget.domain + '?thx_widget_path=/w/' + wallet.uuid,
            uuid: wallet.uuid,
            sub: wallet.sub,
            createdAt: wallet.createdAt,
        }));
    }
}
</script>
