<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Outbound Webhooks</strong>
                <p class="text-muted">Listen to live THX events and forward them to your server.</p>
            </b-col>
            <b-col md="8">
                <b-form-group label="Webhook Signing Secret">
                    <b-input-group>
                        <b-form-input :value="signingSecret" />
                        <b-input-group-append>
                            <b-button size="sm" variant="primary" @click="isSigninSecretHidden = !isSigninSecretHidden">
                                <i v-if="isSigninSecretHidden" class="fas fa-eye px-2"></i>
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
                            Add Endpoint
                        </b-button>
                        <BaseModalWebhookCreate id="modalWebhookCreate" />
                    </template>
                    <BTable :items="webhooksList">
                        <!-- Head formatting -->
                        <template #head(url)>URL</template>
                        <template #head(variant)>Variant</template>
                        <template #head(requestCreated)> Requests </template>
                        <template #head(id)>ID</template>
                        <template #head(status)> Status </template>

                        <!-- Cell formatting -->
                        <template #cell(url)="{ item }">
                            <i class="fas ml-0 mr-2 text-muted fa-globe"></i>
                            <code>{{ item.url }}</code>
                        </template>
                        <template #cell(variant)="{ item }"> {{ item.variant }} </template>
                        <template #cell(requestCreated)="{ item }">
                            {{ item.requestCreated }}
                        </template>
                        <template #cell(id)="{ item }">
                            {{ item.id }}
                            <BaseModalWebhookCreate :id="`modalWebhookCreate${item.id}`" />
                        </template>
                        <template #cell(status)="{ item }">
                            <b-badge variant="success"> {{ item.status }}</b-badge>
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
import { TWebhookState } from '@thxnetwork/dashboard/store/modules/webhooks';

@Component({
    components: { BaseModalWebhookCreate },
    computed: mapGetters({
        webhooks: 'webhooks/all',
        pools: 'pools/all',
    }),
})
export default class CampaignConfigWebhooks extends Vue {
    profile!: TAccount;
    pools!: IPools;
    webhooks!: TWebhookState;
    isSigninSecretHidden = true;
    isCopied = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get signingSecret() {
        if (!this.pool.signingSecret) return '';
        if (this.isSigninSecretHidden) return this.pool.signingSecret.replace(/./g, '•');
        return this.pool.signingSecret;
    }

    get webhooksList() {
        if (!this.webhooks) return [];
        return Object.values(this.webhooks).map((w) => ({ ...w, id: w._id }));
    }

    mounted() {
        this.$store.dispatch('webhooks/list', this.pool);
    }

    onCopySuccess() {
        this.isCopied = true;
    }
}
</script>
<style></style>
