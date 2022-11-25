<template>
    <base-modal size="xl" title="Create ERC20 Reward" :id="id" :error="error" :loading="isLoading">
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
                        <!-- <BaseCardRewardQRCodes class="mb-3" @change="rewardExpiry = $event" /> -->
                        <b-form-checkbox class="mb-0" v-model="isClaimOnce">
                            <strong> Claim once </strong>
                            <p>Allows the user to claim the reward only once.</p>
                        </b-form-checkbox>
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
import { channelList, channelActionList, IChannelAction, IChannel } from '@thxnetwork/dashboard/types/rewards';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import { TERC20Reward } from '@thxnetwork/types/index';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardRewardExpiry,
        BaseCardRewardQRCodes,
    },
})
export default class ModalRewardERC20Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = '0';
    description = '';
    isClaimOnce = true;
    rewardExpiry = {};
    claimAmount = 1;
    rewardLimit = 0;
    rewardCondition: { platform: IChannel; interaction: IChannelAction; content: string } = {
        platform: channelList[0],
        interaction: channelActionList[0],
        content: '',
    };

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TERC20Reward;

    mounted() {
        if (this.reward) {
            this.title = this.reward.title;
            this.amount = String(this.reward.amount);
            // this.description = this.reward.description;
            this.rewardCondition.platform = channelList.find((c) => c.type === this.reward.platform) as IChannel;
            this.rewardCondition.interaction = channelActionList.find(
                (a) => a.type === this.reward.interaction,
            ) as IChannelAction;
            this.rewardCondition.content = this.reward.content as string;
        }
    }

    onSubmit() {
        this.$store.dispatch('erc20Rewards/create', {
            poolId: String(this.pool._id),
            title: this.title,
            description: this.description,
            amount: this.amount,
            claimAmount: this.claimAmount,
            rewardLimit: this.rewardLimit,
            platform: this.rewardCondition.platform,
            interaction: this.rewardCondition.interaction,
            content: this.rewardCondition.content,
        });
    }
}
</script>
