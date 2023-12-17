<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Webhooks</strong>
                <p class="text-muted">Listen to live THX events and forward them to your server.</p>
            </b-col>
            <b-col md="8">
                <b-form-group label="Webhook Signing Secret">
                    <b-input-group>
                        <b-form-input :value="signingSecret" />
                        <b-input-group-append>
                            <b-button
                                size="sm"
                                variant="primary"
                                @click="issigningSecretHidden = !issigningSecretHidden"
                            >
                                <i v-if="issigningSecretHidden" class="fas fa-eye px-2"></i>
                                <i v-else class="fas fa-eye-slash px-2"></i>
                            </b-button>
                            <b-button
                                size="sm"
                                variant="primary"
                                v-clipboard:copy="pool.signingSecret"
                                v-clipboard:success="(isCopied = true)"
                            >
                                <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                                <i v-else class="fas fa-clipboard px-2"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
                <hr />
                <b-form-group>
                    <template #label>
                        Hosted endpoints
                        <b-button
                            size="sm"
                            v-b-modal="'modalWebhookCreate'"
                            variant="primary"
                            class="rounded-pill float-right"
                        >
                            <i class="fas fa-plus mr-2"></i>
                            Add Endpoint
                        </b-button>
                        <BaseModalWebhookCreate id="modalWebhookCreate" :pool="pool" />
                    </template>

                    <BTable :items="webhooksList" id="table-webhooks" responsive="lg" show-empty>
                        <!-- Head formatting -->
                        <template #head(url)>URL</template>
                        <template #head(webhookRequests)> Requests </template>
                        <template #head(status)> Status </template>
                        <template #head(id)> &nbsp;</template>

                        <!-- Cell formatting -->
                        <template #cell(url)="{ item }">
                            <div class="d-flex align-items-center">
                                <i class="fas ml-0 mr-2 text-muted fa-globe"></i>
                                <code>{{ item.url }}</code>
                            </div>
                        </template>
                        <template #cell(webhookRequests)="{ item }">
                            <BaseModalWebhookRequests
                                :id="`modalWebhookRequest${item.id}`"
                                :webhook="Object.values(webhooks[pool._id]).find((w) => w._id === item.id)"
                                :webhook-requests="item.webhookRequests"
                            />
                            <b-link v-if="item.webhookRequests.length" v-b-modal="`modalWebhookRequest${item.id}`">
                                <i class="fas fa-exchange-alt mr-1 text-muted" />
                                {{ item.webhookRequests.length }}
                            </b-link>
                            <template v-else>0</template>
                        </template>
                        <template #cell(status)="{ item }">
                            <b-badge :variant="item.webhookRequests.length ? 'success' : 'light'" class="p-2">
                                {{ item.webhookRequests.length ? 'Active' : 'Inactive' }}
                            </b-badge>
                        </template>
                        <template #cell(id)="{ item }">
                            <b-dropdown variant="link" size="sm" no-caret right>
                                <template #button-content>
                                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                                </template>
                                <b-dropdown-item v-b-modal="`modalWebhookCreate${item.id}`"> Edit </b-dropdown-item>
                                <b-dropdown-item @click="onClickDelete(item)"> Delete </b-dropdown-item>
                            </b-dropdown>
                            <BaseModalWebhookCreate
                                :id="`modalWebhookCreate${item._id}`"
                                :pool="pool"
                                :webhook="item"
                            />
                        </template>
                    </BTable>
                </b-form-group>
            </b-col>
        </b-form-row>
    </div>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { TAccount } from '@thxnetwork/types/interfaces';
import BaseModalWebhookCreate from '@thxnetwork/dashboard/components/modals/BaseModalWebhookCreate.vue';
import BaseModalWebhookRequests from '@thxnetwork/dashboard/components/modals/BaseModalWebhookRequests.vue';
import { TWebhookState } from '@thxnetwork/dashboard/store/modules/webhooks';

@Component({
    components: { BaseModalWebhookCreate, BaseModalWebhookRequests },
    computed: mapGetters({
        webhooks: 'webhooks/all',
        pools: 'pools/all',
    }),
})
export default class CampaignConfigWebhooks extends Vue {
    profile!: TAccount;
    pools!: IPools;
    webhooks!: TWebhookState;
    issigningSecretHidden = true;
    isCopied = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get signingSecret() {
        if (!this.pool.signingSecret) return '';
        if (this.issigningSecretHidden) return this.pool.signingSecret.replace(/./g, '•');
        return this.pool.signingSecret;
    }

    get webhooksList() {
        if (!this.webhooks[this.pool._id]) return [];
        return Object.values(this.webhooks[this.pool._id]).map((w) => {
            return {
                url: w.url,
                // _id: w._id,
                webhookRequests: w.webhookRequests,
                status: w.status,
                id: w._id,
            };
        });
    }

    mounted() {
        this.$store.dispatch('webhooks/list', this.pool);
    }

    onCopySuccess() {
        this.isCopied = true;
    }

    onClickWebhookRequests() {
        //
    }

    async onClickDelete(item: { _id: string }) {
        const webhook = Object.values(this.webhooks[this.pool._id]).find((webhook) => webhook._id === item._id);
        await this.$store.dispatch('webhooks/delete', webhook);
    }
}
</script>
<style lang="scss">
#table-webhooks th:nth-child(1) {
    width: auto;
}
#table-webhooks th:nth-child(2) {
    width: auto;
}
#table-webhooks th:nth-child(3) {
    width: 100px;
}
#table-webhooks th:nth-child(4) {
    width: 50px;
}
</style>
