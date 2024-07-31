<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Webhooks</strong>
                <p class="text-muted">Listen to live THX events and forward them to your server.</p>
            </b-col>
            <b-col md="8">
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
                        <BaseModalWebhookCreate id="modalWebhookCreate" />
                    </template>

                    <BTable hover :items="webhooks" id="table-webhooks" responsive="sm" show-empty>
                        <!-- Head formatting -->
                        <template #head(url)>URL</template>
                        <template #head(signingSecret)> Secret </template>
                        <template #head(webhookRequests)> Requests </template>
                        <template #head(status)> Status </template>
                        <template #head(_id)> &nbsp;</template>

                        <!-- Cell formatting -->
                        <template #cell(url)="{ item }">
                            <div class="d-flex align-items-center">
                                <i class="fas ml-0 mr-2 text-muted fa-globe"></i>
                                <code>{{ item.url }}</code>
                            </div>
                        </template>
                        <template #cell(signingSecret)="{ item }">
                            <b-link
                                v-b-tooltip
                                title="Copy signing secret!"
                                v-clipboard:copy="item.signingSecret"
                                v-clipboard:success="() => (isCopied = true)"
                                class="d-flex align-items-center"
                            >
                                <code>{{ item.signingSecret.substring(1, 10) }}...</code>
                                <i class="fas small ml-1" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                            </b-link>
                        </template>
                        <template #cell(webhookRequests)="{ item }">
                            <BaseModalWebhookRequests
                                :id="`modalWebhookRequest${item._id}`"
                                :webhook="Object.values(webhooks).find((w) => w._id === item._id)"
                                :webhook-requests="item.webhookRequests"
                            />
                            <b-link v-if="item.webhookRequests.length" v-b-modal="`modalWebhookRequest${item._id}`">
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
                        <template #cell(_id)="{ item }">
                            <b-dropdown variant="link" size="sm" no-caret right>
                                <template #button-content>
                                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                                </template>
                                <b-dropdown-item v-b-modal="`modalWebhookCreate${item._id}`"> Edit </b-dropdown-item>
                                <b-dropdown-item @click="onClickDelete(item)"> Delete </b-dropdown-item>
                            </b-dropdown>
                            <BaseModalWebhookCreate :id="`modalWebhookCreate${item._id}`" :webhook="item" />
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
import BaseModalWebhookCreate from '@thxnetwork/dashboard/components/modals/BaseModalWebhookCreate.vue';
import BaseModalWebhookRequests from '@thxnetwork/dashboard/components/modals/BaseModalWebhookRequests.vue';

@Component({
    components: { BaseModalWebhookCreate, BaseModalWebhookRequests },
    computed: mapGetters({
        webhookList: 'developer/webhooks',
        account: 'account/profile',
    }),
})
export default class CampaignConfigWebhooks extends Vue {
    pools!: IPools;
    webhookList!: TWebhookState;
    account!: TAccount;

    isCopied = false;

    get webhooks() {
        return Object.values(this.webhookList).map((w) => {
            return {
                url: w.url,
                webhookRequests: w.webhookRequests,
                signingSecret: w.signingSecret,
                status: w.status,
                _id: w._id,
            };
        });
    }

    async mounted() {
        await this.$store.dispatch('developer/listWebhooks');
    }

    onClickWebhookRequests() {
        //
    }

    async onClickDelete(item: { id: string }) {
        const webhook = Object.values(this.webhooks).find((webhook) => webhook._id === item.id);
        await this.$store.dispatch('webhooks/deleteWebhook', webhook);
    }
}
</script>
<style lang="scss">
#table-webhooks th:nth-child(1) {
    width: auto;
}
#table-webhooks th:nth-child(2) {
    width: 150px;
}
#table-webhooks th:nth-child(3) {
    width: 150px;
}
#table-webhooks th:nth-child(4) {
    width: 100px;
}
</style>
