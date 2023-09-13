<template>
    <b-form-row v-if="profile">
        <b-col md="4">
            <strong>Commerce</strong>
            <p class="text-muted">Enable payment methods and use your widget as a market place for crypto perks.</p>
        </b-col>
        <b-col md="8">
            <b-form-row v-if="!profile.merchant">
                <b-col md="12">
                    <b-alert show variant="success" class="d-flex align-items-center">
                        <i class="fas fa-tags mr-2"></i>
                        Become a merchant and unlock the ability to sell your perks!
                        <b-button
                            class="rounded-pill ml-auto"
                            variant="primary"
                            @click="onClickMerchantCreate"
                            :disabled="isLoadingMerchantCreate"
                        >
                            <b-spinner v-if="isLoadingMerchantCreate" small variant="light" class="mr-2" />
                            Become a Merchant
                        </b-button>
                    </b-alert>
                </b-col>
            </b-form-row>
            <b-form-row v-else>
                <b-col md="8">
                    <b-alert
                        show
                        variant="warning"
                        class="d-flex align-items-center"
                        v-if="merchantStatus.filter((s) => !s.status).length"
                    >
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Complete your commerce configuration.
                        <b-button variant="primary" class="rounded-pill ml-auto" @click="onClickMerchantLink">
                            Continue
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </b-alert>
                    <b-alert show variant="success" class="d-flex align-items-center" v-else>
                        <i class="fas fa-handshake mr-2"></i>
                        Congratulations! You are now able to sell your NFT perks.
                        <b-button variant="primary" class="rounded-pill ml-auto" :to="`/pool/${pool._id}/erc721-perks`">
                            NFT Perks
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </b-alert>
                    <b-form-group label="Stripe Account ID">
                        <b-input-group>
                            <b-form-input
                                readonly
                                disabled
                                :value="profile.merchant ? profile.merchant.stripeConnectId : ''"
                            />
                            <b-input-group-append>
                                <b-button variant="primary" target="_blank" href="https://dashboard.stripe.com">
                                    <!-- <i class="fab fa-stripe-s m-0"></i> -->
                                    <i class="fab fa-cc-stripe m-0" style="font-size: 1.3rem"></i>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-col>
                <b-col md="4">
                    <BCard body-class="bg-light">
                        <b-form-group label="Stripe Connect status:">
                            <b-list-group class="mb-3">
                                <b-list-group-item v-for="(s, key) in merchantStatus" :key="key">
                                    <b-link v-if="!s.status" @click="onClickMerchantLink">
                                        <i
                                            class="fas fa-check-circle mr-2"
                                            :class="s.status ? 'text-success' : 'text-muted'"
                                        >
                                        </i>
                                        {{ s.label }}
                                    </b-link>
                                    <template v-else>
                                        <i
                                            class="fas fa-check-circle mr-2"
                                            :class="s.status ? 'text-success' : 'text-muted'"
                                        >
                                        </i>
                                        {{ s.label }}
                                    </template>
                                </b-list-group-item>
                            </b-list-group>
                            <b-button
                                block
                                variant="danger"
                                @click="onClickDisconnectMerchant"
                                class="rounded-pill"
                                size="sm"
                            >
                                <b-spinner v-if="isLoadingMerchantDisconnect" small variant="light" class="mr-2" />
                                Disconnect
                            </b-button>
                        </b-form-group>
                    </BCard>
                </b-col>
            </b-form-row>
        </b-col>
    </b-form-row>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import type { TAccount } from '@thxnetwork/types/interfaces';
import { TMerchant } from '@thxnetwork/types/merchant';

@Component({
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
            merchant: 'merchants/merchant',
        }),
    },
})
export default class SettingsView extends Vue {
    ChainId = ChainId;
    loading = true;
    chainInfo = chainInfo;
    profile!: TAccount;
    chainId: ChainId = ChainId.PolygonMumbai;
    pools!: IPools;
    merchant!: TMerchant;

    logoImgUrl = '';
    backgroundImgUrl = '';
    isLoadingMerchantCreate = false;
    isLoadingMerchantCreateLink = false;
    isLoadingMerchantDisconnect = false;

    get merchantStatus() {
        if (!this.merchant) return [];
        return [
            {
                status: this.merchant.detailsSubmitted,
                label: 'Provide company details',
            },
            {
                status: this.merchant.chargesEnabled,
                label: 'Enable user payments',
            },
            {
                status: this.merchant.payoutsEnabled,
                label: 'Enable company payouts',
            },
        ];
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async mounted() {
        await this.$store.dispatch('merchants/read');
        this.loading = false;
    }

    async onClickMerchantLink() {
        this.isLoadingMerchantCreateLink = true;
        await this.$store.dispatch('merchants/createLink', this.pool);
        this.isLoadingMerchantCreateLink = false;
    }
    async onClickMerchantCreate() {
        this.isLoadingMerchantCreate = true;
        await this.$store.dispatch('merchants/create');
        await this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('merchants/read');
        this.isLoadingMerchantCreate = false;
    }
    async onClickDisconnectMerchant() {
        this.isLoadingMerchantDisconnect = true;
        await this.$store.dispatch('merchants/delete');
        await this.$store.dispatch('account/getProfile');
        this.isLoadingMerchantDisconnect = false;
    }
}
</script>
