<template>
    <base-modal size="xl" title="Create Points Reward" id="modalRewardPointsCreate" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">
                Points rewards are distributed to your customers achieving milestones in your customer journey.
            </p>
            <form v-on:submit.prevent="onSubmit()" id="formRewardPointsCreate">
                <b-row>
                    <b-col md="6">
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
                    <b-col md="6">
                        <BaseCardRewardCondition
                            class="mb-3"
                            :rewardCondition="rewardCondition"
                            @change="rewardCondition = $event"
                        />
                        <BaseCardRewardExpiry class="mb-3" :expiry="rewardExpiry" @change="rewardExpiry = $event" />
                        <BaseCardRewardQRCodes class="mb-3" @change="rewardExpiry = $event" />
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
import { type TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardRewardExpiry,
        BaseCardRewardQRCodes,
    },
})
export default class ModalRewardPointsCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = '0';
    description = '';
    rewardExpiry = {};
    rewardCondition = {
        platform: platformList[0],
        interaction: platformInteractionList[0],
        content: '',
    };

    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TPointReward;

    mounted() {
        if (this.reward) {
            this.title = this.reward.title;
            this.amount = this.reward.amount;
            this.description = this.reward.description;
            // this.rewardCondition.platform = this.reward.platform;
            // this.rewardCondition.interaction = this.reward.interaction;
            // this.rewardCondition.interaction = this.reward.content;
        }
    }

    onSubmit() {
        this.$store.dispatch('pointRewards/create', {
            title: this.title,
            description: this.description,
            amount: this.amount,
            platform: this.rewardCondition.platform,
            interaction: this.rewardCondition.interaction,
            content: this.rewardCondition.content,
        });
    }
}
</script>
