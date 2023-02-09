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
                <p class="text-muted">Sell your perks to your audience in our widget to make a little extra cash.</p>
                <b-form-group label="Price"> // </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseDropdownTokenMenu from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenuToken.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { mapGetters } from 'vuex';
import { IAccount } from '@thxnetwork/dashboard/types/account';

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
    profile!: IAccount;

    @Prop() pool!: IPool;

    async onClickMerchantCreate() {
        await this.$store.dispatch('merchants/create');
        await this.$store.dispatch('account/read');
    }
}
</script>
