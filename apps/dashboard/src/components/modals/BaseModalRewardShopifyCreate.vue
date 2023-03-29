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
                        <BaseCardCommerce
                            v-if="profile && profile.plan === 1"
                            class="mb-3"
                            :pool="pool"
                            :price="price"
                            :price-currency="priceCurrency"
                            @change-price="price = $event"
                            @change-price-currency="priceCurrency = $event"
                        />
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits class="mb-3" :limit="limit" @change-reward-limit="limit = $event" />
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import BaseCardCommerce from '../cards/BaseCardCommerce.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseDropdownSelectShopifyPriceRule from '../dropdowns/BaseDropdownSelectShopifyPriceRule.vue';
import { TShopifyPerkState, TShopifyPriceRule } from '@thxnetwork/dashboard/store/modules/shopifyPerks';
import { mapGetters } from 'vuex';
import { TPool, TShopifyPerk } from '@thxnetwork/types/interfaces';
import { IAccount } from '@thxnetwork/dashboard/types/account';

@Component({
    components: {
        BaseModal,
        BaseCardCommerce,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
        BaseDropdownSelectShopifyPriceRule,
    },
    computed: mapGetters({
        shopifyPerks: 'shopifyPerks/all',
        profile: 'account/profile',
    }),
})
export default class ModalRewardShopifyCreate extends Vue {
    isLoading = false;
    error = '';
    title = '';
    description = '';
    expiryDate: Date | null = null;
    limit = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    isPromoted = false;
    priceRuleId: string | null = null;
    discountCode: string | null = null;
    shopifyPerks!: TShopifyPerkState;
    profile!: IAccount;
    price = 0;
    priceCurrency = 'USD';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TShopifyPerk;

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.pointPrice = this.reward ? this.reward.pointPrice : 0;
        this.price = this.reward ? this.reward.price : this.price;
        this.priceCurrency = this.reward ? this.reward.priceCurrency : this.priceCurrency;
        this.expiryDate = this.reward ? this.reward.expiryDate : null;
        this.limit = this.reward ? this.reward.limit : 0;
        this.image = this.reward && this.reward.image ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : false;
        this.priceRuleId = this.reward ? this.reward.priceRuleId : null;
        this.discountCode = this.reward ? this.reward.discountCode : null;
    }

    get isSubmitDisabled() {
        return this.isLoading || !this.priceRuleId || !this.discountCode || !this.title;
    }

    onSubmit() {
        this.isLoading = true;

        const payload = {
            page: 1,
            poolId: String(this.pool._id),
            title: this.title,
            description: this.description,
            pointPrice: this.pointPrice,
            limit: this.limit,
            file: this.imageFile,
            isPromoted: this.isPromoted,
            priceRuleId: this.priceRuleId,
            discountCode: this.discountCode,
            price: this.price,
            priceCurrency: this.priceCurrency,
        };

        if (this.expiryDate) Object.assign(payload, { expiryDate: this.expiryDate });

        this.$store
            .dispatch(`shopifyPerks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }

    onChangePointPrice(price: number) {
        this.pointPrice = price;
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
