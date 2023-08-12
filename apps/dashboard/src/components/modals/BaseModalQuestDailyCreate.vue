<template>
    <base-modal
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Daily Quest'"
        :id="id"
        :error="error"
        :loading="isLoading"
        @show="onShow"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit()" id="formRewardDailyCreate">
                <b-row>
                    <b-col>
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
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
                    </b-col>
                    <b-col md="6">
                        <BaseCardURLWebhook
                            :visible="isEnabledWebhookQualification"
                            :code="code"
                            class="mb-3"
                            title="Webhook Qualification"
                            description="You can also choose to run this webhook to qualify the daily reward and trigger a point transfer."
                        >
                            <template #alerts>
                                <b-alert show variant="info">
                                    <i class="fas fa-question-circle mr-2"></i> Take note of these development
                                    guidelines:
                                    <ul class="px-3 mb-0 mt-1 small">
                                        <li v-if="!reward">
                                            <strong>TOKEN</strong> will be populated after creating this daily reward.
                                        </li>
                                        <li>
                                            <strong>ADDRESS</strong> should be provided by your app and owned by the
                                            targeted user in our system.
                                        </li>
                                    </ul>
                                </b-alert>
                            </template>
                        </BaseCardURLWebhook>
                        <BaseCardInfoLinks :info-links="infoLinks" @change-link="onChangeLink">
                            <p class="text-muted">
                                Add info links to your cards to provide more information to your audience.
                            </p>
                        </BaseCardInfoLinks>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled || !title || !amounts.length"
                class="rounded-pill"
                type="submit"
                form="formRewardDailyCreate"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' Daily Quest' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TDailyReward, TInfoLink, TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseCardURLWebhook from '../BaseCardURLWebhook.vue';
import BaseModal from './BaseModal.vue';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardURLWebhook,
        BaseCardInfoLinks,
    },
    computed: mapGetters({
        totals: 'dailyRewards/totals',
    }),
})
export default class ModalRewardDailyCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amounts = [5, 10, 20, 40, 80, 160, 360];
    description = '';
    limit = 0;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    isEnabledWebhookQualification = false;

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TDailyReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/daily/${this.reward ? this.reward.uuid : '<TOKEN>'}" \\
-X POST \\
-d "address=<ADDRESS>"`;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.amounts = this.reward ? this.reward.amounts : this.amounts;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.isEnabledWebhookQualification = this.reward
            ? this.reward.isEnabledWebhookQualification
            : this.isEnabledWebhookQualification;
    }

    onChangeLink({ key, label, url }: TInfoLink & { key: number }) {
        let update = {};

        if (label || label === '') update = { ...this.infoLinks[key], label };
        if (url || url === '') update = { ...this.infoLinks[key], url };
        if (typeof label === 'undefined' && typeof url === 'undefined') {
            Vue.delete(this.infoLinks, key);
        } else {
            Vue.set(this.infoLinks, key, update);
        }
    }

    onSubmit() {
        const payload = {
            ...this.reward,
            _id: this.reward ? this.reward._id : undefined,
            poolId: this.pool._id,
            title: this.title,
            description: this.description,
            amounts: JSON.stringify(this.amounts),
            limit: this.limit,
            page: this.reward ? this.reward.page : 1,
            infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
            isEnabledWebhookQualification: this.isEnabledWebhookQualification,
            index: !this.reward ? this.total : this.reward.index,
        };

        this.isLoading = true;
        this.$store.dispatch(`dailyRewards/${this.reward ? 'update' : 'create'}`, payload).then(() => {
            this.$bvModal.hide(this.id);
            this.$emit('submit');
            this.isLoading = false;
        });
    }
}
</script>
