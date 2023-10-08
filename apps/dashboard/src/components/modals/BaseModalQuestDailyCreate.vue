<template>
    <BaseModalQuestCreate
        variant="Daily Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-info-links="infoLinks = Object.values($event)"
        @change-title="title = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-published="isPublished = $event"
        :info-links="infoLinks"
        :id="id"
        :error="error"
        :loading="isLoading"
        :published="isPublished"
        :disabled="isSubmitDisabled || !title"
        :quest="reward"
    >
        <template #col-left>
            <b-form-group label="Amounts">
                <b-form-group :key="key" v-for="(amount, key) of amounts">
                    <b-input-group :prepend="`Day ${key + 1}`">
                        <b-form-input v-model="amounts[key]" type="number" />
                        <b-input-group-append>
                            <b-button @click="$delete(amounts, key)" variant="gray">
                                <i class="fas fa-times ml-0"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
                <b-link @click="$set(amounts, amounts.length, 0)">Add amount</b-link>
            </b-form-group>
            <b-form-group label="Qualification">
                <b-form-checkbox v-model="isEnabledWebhookQualification">
                    Enable mandatory webhook qualification
                </b-form-checkbox>
            </b-form-group>
        </template>
        <template #col-right>
            <BaseCardURLWebhook
                :visible="isEnabledWebhookQualification"
                :code="code"
                class="mb-3"
                title="Webhook Qualification"
                description="You can also choose to run this webhook to qualify the daily reward and trigger a point transfer."
            >
                <template #alerts>
                    <b-alert show variant="info">
                        <i class="fas fa-question-circle mr-2"></i> Take note of these development guidelines:
                        <ul class="px-3 mb-0 mt-1 small">
                            <li v-if="!reward">
                                <strong>TOKEN</strong> will be populated after creating this daily reward.
                            </li>
                            <li>
                                <strong>CODE</strong> should be the virtual wallet code obtained for the user after
                                running the virtual wallet webhook
                            </li>
                        </ul>
                    </b-alert>
                </template>
            </BaseCardURLWebhook>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import type { TDailyReward, TInfoLink, TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
        BaseCardURLWebhook,
    },
    computed: mapGetters({
        totals: 'dailyRewards/totals',
    }),
})
export default class ModalRewardDailyCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isPublished = false;
    error = '';
    title = '';
    amounts = [5, 10, 20, 40, 80, 160, 360];
    description = '';
    limit = 0;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    isEnabledWebhookQualification = false;
    file: File | null = null;

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TDailyReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/daily/${this.reward ? this.reward.uuid : '<TOKEN>'}" \\
-X POST \\
-d "code=<CODE>"`;
    }

    onShow() {
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.amounts = this.reward ? this.reward.amounts : this.amounts;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.isEnabledWebhookQualification = this.reward
            ? this.reward.isEnabledWebhookQualification
            : this.isEnabledWebhookQualification;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`dailyRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                _id: this.reward ? this.reward._id : undefined,
                poolId: this.pool._id,
                title: this.title,
                description: this.description,
                amounts: JSON.stringify(this.amounts),
                limit: this.limit,
                file: this.file,
                isPublished: this.isPublished,
                page: this.reward ? this.reward.page : 1,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                isEnabledWebhookQualification: this.isEnabledWebhookQualification,
                index: !this.reward ? this.total : this.reward.index,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit');
                this.isLoading = false;
            });
    }
}
</script>
