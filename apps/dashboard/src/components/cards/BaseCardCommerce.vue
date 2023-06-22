<template>
    <b-card body-class="bg-light p-0" class="mb-3">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-url-qualify
        >
            <i class="fas fa-tags mr-2"></i>
            <strong class="mr-auto"> Commerce </strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-url-qualify" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <b-alert v-if="profile && !profile.merchant" show variant="success" class="d-flex align-items-center">
                    Enable commerce and sell your perks!
                    <b-button size="sm" variant="primary" class="rounded-pill ml-auto" @click="onClickMerchantCreate">
                        Become a Merchant
                    </b-button>
                </b-alert>
                <p class="text-muted">
                    Sell your perks to your audience in our widget to make a little extra cash. Pick any supported FIAT
                    or Crypto currency.
                </p>
                <b-form-group label="Price">
                    <b-input-group>
                        <b-form-input step=".01" type="number" :value="p" @change="onChangePrice" />
                        <b-input-group-append>
                            <b-dropdown variant="dark" :text="priceCurrency">
                                <b-dropdown-item @click="$emit('change-price-currency', 'EUR')">EUR</b-dropdown-item>
                                <b-dropdown-item @click="$emit('change-price-currency', 'USD')">USD</b-dropdown-item>
                                <b-dropdown-divider></b-dropdown-divider>
                                <b-dropdown-item disabled>$THX</b-dropdown-item>
                            </b-dropdown>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import type { TAccount, TPool } from '@thxnetwork/types/index';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseDropdownTokenMenu from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenuToken.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import { mapGetters } from 'vuex';
import { parseUnitAmount } from '@thxnetwork/dashboard/utils/price';

@Component({
    components: {
        BaseModalPoolCreate,
        BaseCard,
        BaseBadgeNetwork,
        BaseIdenticon,
        BaseDropdownTokenMenu,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseCardERC20 extends Vue {
    isVisible = true;
    profile!: TAccount;

    @Prop() price!: number;
    @Prop() priceCurrency!: string;
    @Prop() pool!: TPool;

    get p() {
        return parseUnitAmount(this.price);
    }

    async onClickMerchantCreate() {
        await this.$store.dispatch('merchants/create');
        await this.$store.dispatch('account/read');
    }

    onChangePrice(value: string) {
        const price = (Math.round(Number(value) * 100) / 100).toFixed(2);
        this.$emit('change-price', Number(price) * 100);
    }
}
</script>
