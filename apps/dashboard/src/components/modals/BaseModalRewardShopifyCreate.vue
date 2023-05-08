<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="perk ? 'Update Shopify Perk' : 'Create Shopify Perk'"
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
                {{ perk ? 'Update Shopify Perk' : 'Create Shopify Perk' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
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
    @Prop({ required: false }) perk!: TShopifyPerk;

    onShow() {
        this.title = this.perk ? this.perk.title : '';
        this.description = this.perk ? this.perk.description : '';
        this.pointPrice = this.perk ? this.perk.pointPrice : 0;
        this.price = this.perk ? this.perk.price : this.price;
        this.priceCurrency = this.perk ? this.perk.priceCurrency : this.priceCurrency;
        this.expiryDate = this.perk ? this.perk.expiryDate : null;
        this.limit = this.perk ? this.perk.limit : 0;
        this.image = this.perk && this.perk.image ? this.perk.image : '';
        this.isPromoted = this.perk ? this.perk.isPromoted : false;
        this.priceRuleId = this.perk ? this.perk.priceRuleId : null;
        this.discountCode = this.perk ? this.perk.discountCode : null;
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
            .dispatch(`shopifyPerks/${this.perk ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.perk,
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
