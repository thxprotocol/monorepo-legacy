<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="reward ? 'Update ERC20 Reward' : 'Create ERC20 Reward'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">
                Points rewards are distributed to your customers achieving milestones in your customer journey.
            </p>
            <form v-on:submit.prevent="onSubmit" id="formRewardPointsCreate">
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
                        <b-form-group label="Point Price">
                            <b-form-input type="number" v-model="pointPrice" />
                        </b-form-group>
                        <b-form-group label="Is Promoted">
                            <b-form-checkbox v-model="isPromoted" />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardRewardCondition
                            class="mb-3"
                            :rewardCondition="rewardCondition"
                            @change="rewardCondition = $event"
                        />
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :rewardLimit="rewardLimit"
                            :expiry="rewardExpiry"
                            @change="rewardExpiry = $event"
                        />
                        <!-- <BaseCardRewardQRCodes class="mb-3" @change="rewardExpiry = $event" /> -->
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
import { platformList, platformInteractionList } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform, type TERC20Perk } from '@thxnetwork/types/index';
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
export default class ModalRewardERC20Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = '0';
    description = '';
    rewardExpiry = {};
    claimAmount = 1;
    rewardLimit = 0;
    pointPrice = 0;
    rewardCondition: { platform: RewardConditionPlatform; interaction: RewardConditionInteraction; content: string } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    isPromoted = false;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TERC20Perk;

    onShow() {
        if (this.reward) {
            this.title = this.reward.title;
            this.amount = String(this.reward.amount);
            this.description = this.reward.description;
            this.pointPrice = this.reward.pointPrice;
            this.rewardCondition = {
                platform: this.reward.platform as RewardConditionPlatform,
                interaction: this.reward.interaction as RewardConditionInteraction,
                content: this.reward.content as string,
            };
            this.isPromoted = this.reward.isPromoted;
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`erc20Perks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    page: 1,
                    poolId: String(this.pool._id),
                    title: this.title,
                    description: this.description,
                    amount: this.amount,
                    pointPrice: this.pointPrice,
                    claimAmount: this.claimAmount,
                    rewardLimit: this.rewardLimit,
                    platform: this.rewardCondition.platform,
                    interaction: this.rewardCondition.interaction,
                    content: this.rewardCondition.content,
                    isPromoted: this.isPromoted,
                },
            })
            .then(() => {
                this.$emit('submit');
                this.$bvModal.hide(this.id);
                this.title = '';
                this.amount = '0';
                this.description = '';
                this.rewardExpiry = {};
                this.claimAmount = 1;
                this.rewardLimit = 0;
                this.rewardCondition = {
                    platform: platformList[0].type,
                    interaction: platformInteractionList[0].type,
                    content: '',
                };
                this.isPromoted = false;
                this.isLoading = false;
            });
    }
}
</script>
