<template>
    <base-modal size="xl" title="Create Milestone Reward" :id="id" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <BaseWebhookUrl v-if="reward" :code="code" />
            <form v-on:submit.prevent="onSubmit" id="formRewardPointsCreate">
                <b-row>
                    <b-col md="12">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input v-model="amount" />
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button :disabled="isSubmitDisabled" class="rounded-pill" type="submit" form="formRewardPointsCreate"
                variant="primary" block>
                {{ reward ? 'Update Reward' : 'Create Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { UserProfile } from 'oidc-client-ts';
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TMilestoneReward } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseWebhookUrl from '../BaseWebhookUrl.vue';
import { API_URL } from '../../../../wallet/src/utils/secrets';


@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseWebhookUrl,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class ModalMilestoneRewardCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    error = '';
    title = '';
    amount = '0';
    successUrl = '';
    description = '';
    claimAmount = 1;
    isCopied = false;
    profile!: UserProfile;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TMilestoneReward;

    get code() {
        if (!this.reward) {
            return '';
        }
        return `curl "${API_URL}/v1/webhook/milestone/${this.reward.uuid}/claim" -X POST -d "{"address": "${this.profile.address}"}"`;
    }

    mounted() {
        if (this.reward) {
            this.title = this.reward.title;
            this.amount = String(this.reward.amount);
            this.description = this.reward.description;
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`milestoneRewards/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    poolId: String(this.pool._id),
                    title: this.title,
                    description: this.description,
                    amount: this.amount,
                    claimAmount: this.claimAmount,
                    successUrl: this.successUrl,
                },
            })
            .then(() => {
                this.$emit('submit');
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
