<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="reward ? 'Update Coin Perk' : 'Create Coin Perk'"
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
                        <b-form-group label="Image">
                            <b-input-group>
                                <template #prepend v-if="image">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="image" height="35" width="auto" />
                                    </div>
                                </template>
                                <b-form-file v-model="imageFile" accept="image/*" @change="onImgChange" />
                            </b-input-group>
                        </b-form-group>
                        <b-form-group label="Coin">
                            <BaseDropdownSelectERC20 @selected="erc20Id = $event._id" :chainId="pool.chainId" />
                        </b-form-group>
                        <b-row>
                            <b-col md="6">
                                <b-form-group label="Amount">
                                    <b-form-input v-model="amount" />
                                </b-form-group>
                            </b-col>
                            <b-col md="6">
                                <b-form-group label="Point Price">
                                    <b-form-input type="number" v-model="pointPrice" />
                                </b-form-group>
                            </b-col>
                        </b-row>
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
                        <hr />
                        <b-form-group>
                            <b-form-checkbox v-model="isPromoted">Promoted</b-form-checkbox>
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
import { platformList, platformInteractionList } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform, type TERC20Perk } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import BaseDropdownSelectERC20 from '../dropdowns/BaseDropdownSelectERC20.vue';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardRewardExpiry,
        BaseCardRewardQRCodes,
        BaseDropdownSelectERC20,
    },
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class ModalRewardERC20Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    error = '';
    erc20Id = '';
    title = '';
    amount = '0';
    description = '';
    rewardExpiry = {};
    claimAmount = 1;
    rewardLimit = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    rewardCondition: { platform: RewardConditionPlatform; interaction: RewardConditionInteraction; content: string } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    isPromoted = false;
    profile!: IAccount;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TERC20Perk;

    onShow() {
        if (this.reward) {
            this.erc20Id = this.reward.erc20Id;
            this.title = this.reward.title;
            this.amount = String(this.reward.amount);
            this.description = this.reward.description;
            this.pointPrice = this.reward.pointPrice;
            this.rewardCondition = {
                platform: this.reward.platform as RewardConditionPlatform,
                interaction: this.reward.interaction as RewardConditionInteraction,
                content: this.reward.content as string,
            };
            if (this.reward.image) {
                this.image = this.reward.image;
            }
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
                    erc20Id: this.erc20Id,
                    title: this.title,
                    description: this.description,
                    amount: this.amount,
                    pointPrice: this.pointPrice,
                    claimAmount: this.claimAmount,
                    rewardLimit: this.rewardLimit,
                    platform: this.rewardCondition.platform,
                    interaction: this.rewardCondition.interaction,
                    content: this.rewardCondition.content,
                    file: this.imageFile,
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
                this.image = '';
                this.isPromoted = false;
                this.isLoading = false;
            });
    }

    onImgChange() {
        this.image = '';
    }
}
</script>
