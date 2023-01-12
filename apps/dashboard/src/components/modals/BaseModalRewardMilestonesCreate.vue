<template>
    <base-modal size="xl" title="Create Milestone Reward" :id="id" :error="error" :loading="isLoading" @show="onShow">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">
                Milestone rewards are distributed to your customers that have completed reward conditions in external
                platforms.
            </p>
            <form v-on:submit.prevent="onSubmit()" id="formRewardMilestoneCreate">
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
                {{ reward ? 'Update Reward' : 'Create Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { type TPointReward } from '@thxnetwork/types/interfaces/PointReward';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import { mapGetters } from 'vuex';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/index';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardRewardExpiry,
        BaseCardRewardQRCodes,
    },
    computed: mapGetters({
        totals: 'milestones/totals',
    }),
})
export default class ModalRewardMilestoneCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    title = '';
    amount = '0';
    description = '';
    rewardExpiry = {};
    rewardLimit = 0;
    rewardCondition: { platform: RewardConditionPlatform; interaction: RewardConditionInteraction; content: string } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TPointReward;

    onShow() {
        this.setValues(this.reward);
    }

    setValues(reward?: TPointReward) {
        if (!reward) return;
        this.title = this.reward.title;
        this.amount = this.reward.amount;
        this.description = this.reward.description;
        this.rewardLimit = this.reward.rewardLimit;
        this.rewardCondition = {
            platform: this.reward.platform as RewardConditionPlatform,
            interaction: this.reward.interaction as RewardConditionInteraction,
            content: this.reward.content as string,
        };
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`milestones/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                _id: this.reward ? this.reward._id : undefined,
                poolId: this.pool._id,
                title: this.title,
                description: this.description,
                amount: this.amount,
                rewardLimit: this.rewardLimit,
                platform: this.rewardCondition.platform,
                interaction: this.rewardCondition.interaction,
                content: this.rewardCondition.content,
                page: this.reward ? this.reward.page : 1,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit')
                this.title = '';
                this.amount = '0';
                this.description = '';
                this.rewardExpiry = {};
                this.rewardLimit = 0;
                this.rewardCondition = {
                    platform: platformList[0].type,
                    interaction: platformInteractionList[0].type,
                    content: '',
                };
                this.isLoading = false;
            });
    }
}
</script>
