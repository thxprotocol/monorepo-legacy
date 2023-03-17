<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="reward ? 'Update Shopify Perk' : 'Create Shopify Perk'"
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
                        <b-row>
                            <b-col md="6">
                                <b-form-group label="Point Price">
                                    <b-form-input type="number" :value="pointPrice" @input="onChangePointPrice" />
                                </b-form-group>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-form-group label="Discount Price Rule">
                                    <BaseDropdownSelectShopifyPriceRule
                                        :selectedPriceRuleId="priceRuleId"
                                        @selected="onPriceRuleSelected"
                                        :pool="pool"
                                    />
                                </b-form-group>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <b-form-group label="Discount Code Prefix">
                                    <b-form-input type="text" :value="discountCode" @input="onDiscountCodeInput" />
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
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits
                            class="mb-3"
                            :limit="limit"
                            :claimAmount="claimAmount"
                            :claimLimit="claimLimit"
                            @change-reward-limit="limit = $event"
                            @change-claim-amount="onChangeClaimAmount"
                        />
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
                {{ reward ? 'Update Shopify Perk' : 'Create Shopify Perk' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { platformList, platformInteractionList } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform, type TShopifyPerk } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseDropdownSelectShopifyPriceRule from '../dropdowns/BaseDropdownSelectShopifyPriceRule.vue';
import { TShopifyPerkState, TShopifyPriceRule } from '@thxnetwork/dashboard/store/modules/shopifyPerks';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
        BaseCardRewardQRCodes,
        BaseDropdownSelectShopifyPriceRule,
    },
    computed: mapGetters({
        shopifyPerks: 'shopifyPerks/all',
    }),
})
export default class ModalRewardShopifyCreate extends Vue {
    isLoading = false;
    error = '';
    title = '';
    description = '';
    expiryDate: Date | null = null;
    claimAmount = 0;
    claimLimit = 1;
    limit = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    rewardCondition: { platform: RewardConditionPlatform; interaction: RewardConditionInteraction; content: string } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    isPromoted = false;
    priceRuleId: string | null = null;
    discountCode: string | null = null;
    shopifyPerks!: TShopifyPerkState;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TShopifyPerk;

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.pointPrice = this.reward ? this.reward.pointPrice : 0;
        this.expiryDate = this.reward ? this.reward.expiryDate : null;
        this.limit = this.reward ? this.reward.limit : 0;
        this.claimLimit = this.reward ? this.reward.claimLimit : 1;
        this.claimAmount = this.reward ? this.reward.claimAmount : 0;
        this.rewardCondition = this.reward
            ? {
                  platform: this.reward.platform as RewardConditionPlatform,
                  interaction: this.reward.interaction as RewardConditionInteraction,
                  content: this.reward.content as string,
              }
            : {
                  platform: platformList[0].type,
                  interaction: platformInteractionList[0].type,
                  content: '',
              };

        this.image = this.reward && this.reward.image ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : false;
        this.priceRuleId = this.reward ? this.reward.priceRuleId : null;
        this.discountCode = this.reward ? this.reward.discountCode : null;
    }

    get isSubmitDisabled() {
        return !this.priceRuleId || !this.discountCode || !this.pointPrice || this.title === '';
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`shopifyPerks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    page: 1,
                    poolId: String(this.pool._id),
                    title: this.title,
                    description: this.description,
                    pointPrice: this.pointPrice,
                    claimAmount: Number(this.claimAmount),
                    claimLimit: this.claimLimit,
                    limit: this.limit,
                    platform: this.rewardCondition.platform,
                    interaction: this.rewardCondition.interaction,
                    content: this.rewardCondition.content,
                    file: this.imageFile,
                    isPromoted: this.isPromoted,
                    priceRuleId: this.priceRuleId,
                    discountCode: this.discountCode,
                },
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }

    onChangePointPrice(price: number) {
        this.pointPrice = price;
        if (price > 0) this.claimAmount = 0;
    }

    onChangeClaimAmount(amount: number) {
        this.claimAmount = amount;
        if (amount > 0) this.pointPrice = 0;
    }

    onImgChange() {
        this.image = '';
    }

    onPriceRuleSelected(priceRule: TShopifyPriceRule) {
        this.priceRuleId = priceRule.id;
        this.discountCode = priceRule.title;
    }

    onDiscountCodeInput(value: string) {
        this.discountCode = value.toUpperCase();
    }
}
</script>
