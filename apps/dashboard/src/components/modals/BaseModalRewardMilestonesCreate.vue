<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Custom Quest'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit" id="formRewardMilestoneCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input type="number" v-model="amount" />
                        </b-form-group>
                        <b-form-group label="Limit" description="Maximum amount of claims per acount.">
                            <b-form-input type="number" v-model="limit" min="0" />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardURLWebhook
                            :code="code"
                            title="Webhook Qualification"
                            description="Run this webhook to qualify an account wallet address for the claim of this reward."
                        >
                            <template #alerts>
                                <b-alert show variant="info">
                                    <i class="fas fa-question-circle mr-2"></i> Take note of these development
                                    guidelines:
                                    <ul class="px-3 mb-0 mt-1 small">
                                        <li v-if="!reward">
                                            <strong>TOKEN</strong> will be populated after creating this reward.
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
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardMilestoneCreate"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' Custom Quest' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { TInfoLink, type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TMilestoneReward } from '@thxnetwork/types/index';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardURLWebhook from '../BaseCardURLWebhook.vue';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardURLWebhook,
        BaseCardInfoLinks,
    },
})
export default class ModalMilestoneRewardCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    error = '';
    title = '';
    description = '';
    amount = 0;
    limit = 0;
    isCopied = false;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TMilestoneReward;

    get code() {
        return `curl "${API_URL}/v1/webhook/milestone/${this.reward ? this.reward.uuid : '<TOKEN>'}/claim" \\
-X POST \\
-d "address=<ADDRESS>"`;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.limit = this.reward && this.reward.limit ? this.reward.limit : this.limit;
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
        this.isLoading = true;
        this.$store
            .dispatch(`milestoneRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                page: 1,
                poolId: String(this.pool._id),
                title: this.title,
                description: this.description,
                amount: this.amount,
                limit: this.limit,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit');
                this.isLoading = false;
            });
    }
}
</script>
