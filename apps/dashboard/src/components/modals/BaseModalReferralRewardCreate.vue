<template>
    <base-modal size="xl" title="Create Referral Reward" :id="id" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">
                Points rewards are distributed to your customers achieving milestones in your customer journey.
            </p>
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
                        <b-form-group label="Succes URL">
                            <b-form-input v-model="successUrl" />
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardPointsCreate"
                variant="primary"
                block
            >
                {{ reward ? 'Update Reward' : 'Create Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TReferralReward } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
    },
})
export default class ModalReferralRewardCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = '0';
    successUrl = '';
    description = '';
    claimAmount = 1;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TReferralReward;

    mounted() {
        if (this.reward) {
            this.title = this.reward.title;
            this.amount = String(this.reward.amount);
            this.description = this.reward.description;
            this.successUrl = this.reward.successUrl;
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`referralRewards/${this.reward ? 'update' : 'create'}`, {
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
                this.$emit('submit')
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
