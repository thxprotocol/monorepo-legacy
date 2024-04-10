<template>
    <base-modal @show="onShow" @hidden="$emit('hidden')" :error="error" title="Make a payment" :id="id">
        <template #modal-body>
            <form v-on:submit.prevent="onClickVerify" id="formPaymentCreate">
                <b-form-group label="Select your payment plan:">
                    <b-row>
                        <b-col :key="key" v-for="(planType, key) of [AccountPlanType.Lite, AccountPlanType.Premium]">
                            <b-form-radio v-model="plan" name="paymentVariant" :value="planType">
                                <div class="d-flex">
                                    <strong> {{ plans[planType].name }}</strong>
                                    <span class="ml-auto text-success">
                                        {{ toFiatPrice(planPricingMap[planType].costSubscription / 100) }}
                                    </span>
                                </div>
                                <div class="small text-muted">
                                    <div class="d-flex">
                                        MAP Limit <i class="fas fa-circle-info" v-b-tooltip title="MAP" />
                                        <span class="ml-auto"> {{ planPricingMap[planType].subscriptionLimit }}x </span>
                                    </div>
                                    <div class="d-flex">
                                        Additional MAP
                                        <span class="ml-auto">
                                            {{ toFiatPrice(planPricingMap[planType].costPerUnit / 100) }}
                                        </span>
                                    </div>
                                </div>
                            </b-form-radio>
                        </b-col>
                    </b-row>
                </b-form-group>
                <b-form-group label="Select the amount weeks:">
                    <b-form-input v-model="duration" type="range" min="4" max="52" step="1" />
                    {{ duration }}
                </b-form-group>
                <hr />
                <b-form-group v-if="pool && pool.safeAddress">
                    <template #label>
                        Transfer
                        <strong class="text-success">
                            {{ toFiatPrice(paymentAmount) }}
                        </strong>
                        in
                        <b-link :href="`${chain.blockExplorer}/token/${addresses.USDC}`" class="text-white">
                            USDC on {{ chain.name }}
                            <i class="fas fa-external-link-alt" />
                        </b-link>
                        to your campaign address:
                    </template>
                    <b-form-input v-model="pool.safeAddress" readonly />
                </b-form-group>
                <b-alert show variant="primary" v-if="isBalanceChecked">
                    Your multisigs USDC balance is <strong>{{ balanceInUSD }}</strong>
                </b-alert>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                v-if="isInsufficientBalance"
                type="submit"
                form="formPaymentCreate"
                variant="primary"
                block
                class="rounded-pill"
                :disabled="isLoading"
            >
                <b-spinner v-if="isLoading" small />
                <span v-else>Check Balance</span>
            </b-button>
            <b-button
                v-else
                @click="onClickComplete"
                variant="success"
                block
                class="rounded-pill"
                :disabled="isLoading"
            >
                <b-spinner v-if="isLoading" small />
                <span v-else>Complete Payment</span>
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { AccountPlanType } from '@thxnetwork/common/enums';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { planPricingMap } from '@thxnetwork/common/constants';
import { toFiatPrice } from '@thxnetwork/dashboard/utils/price';
import { plans } from '@thxnetwork/dashboard/utils/plans';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import { mapGetters } from 'vuex';
import { TERC20BalanceState } from '@thxnetwork/dashboard/types/erc20';
import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import BaseModal from './BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({
        erc20BalanceList: 'erc20/balances',
    }),
})
export default class BaseModalPaymentCreate extends Vue {
    error = '';
    plan = AccountPlanType.Premium;
    AccountPlanType = AccountPlanType;
    duration = 12;
    planPricingMap = planPricingMap;
    toFiatPrice = toFiatPrice;
    plans = plans;
    erc20BalanceList!: TERC20BalanceState;
    parseUnits = parseUnits;
    isLoading = false;
    isBalanceChecked = false;
    chainInfo = chainInfo;

    @Prop() id!: string;
    @Prop() pool!: TPool;

    get chain() {
        if (!this.pool || !this.pool.safe) return { name: 'Unknown', blockExplorer: '' };
        return chainInfo[this.pool.safe.chainId];
    }

    get paymentAmount() {
        // amount of weeks * sub costs / 4 weeks / 100 (correct decimals)
        return this.duration * (planPricingMap[this.plan].costSubscription / 4 / 100);
    }

    get isInsufficientBalance() {
        if (!this.balanceInWei) return true;
        const amount = parseUnits(this.paymentAmount.toString(), 'ether');
        return BigNumber.from(this.balanceInWei).lt(amount);
    }

    get balanceInWei() {
        if (!this.erc20BalanceList[this.addresses.USDC]) return '';
        return this.erc20BalanceList[this.addresses.USDC][this.pool.safeAddress as string];
    }

    get balanceInUSD() {
        if (!this.balanceInWei) return toFiatPrice(0);
        const costs = formatUnits(this.balanceInWei, 'ether');
        return toFiatPrice(Number(costs));
    }

    get addresses() {
        if (!this.pool || !this.pool.safe) return '';
        return contractNetworks[this.pool.safe.chainId];
    }

    async getBalance() {
        await this.$store.dispatch('erc20/balanceOf', {
            pool: this.pool,
            tokenAddress: this.addresses.USDC,
        });
    }

    onShow() {
        // this.getBalance();
    }

    async onClickVerify() {
        this.isLoading = true;
        await this.getBalance();
        this.isLoading = false;
        this.isBalanceChecked = true;
    }

    async onClickComplete() {
        const amountInWei = parseUnits(this.paymentAmount.toString(), 6);

        await this.$store.dispatch('pools/createPayment', {
            pool: this.pool,
            amountInWei,
        });
    }
}
</script>
