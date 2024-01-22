<template>
    <base-modal
        size="lg"
        :title="`Top up a pool with ${erc20.symbol}`"
        :id="`modalDepositCreate-${erc20._id}`"
        @show="onShow"
        :loading="loading"
        :error="error"
    >
        <template #modal-body v-if="!loading && erc20">
            <b-alert v-if="erc20.type === ERC20Type.Unlimited" variant="info" show>
                <i class="fas fa-info-circle mr-2"></i>
                <strong>Info:</strong> No need to top up your pool, coins will be minted when transfered to a
                beneficiary.
            </b-alert>

            <template v-if="erc20.type === ERC20Type.Unknown">
                <b-alert variant="warning" show>
                    <i class="fas fa-info-circle mr-2"></i> <strong>Warning: </strong>We are not able to make deposits
                    for this coin on your behalf.
                </b-alert>
                <p>
                    Transfer your <strong>{{ erc20.symbol }}</strong> on
                    <strong>{{ chainInfo[erc20.chainId].name }}</strong> to
                    <b-link
                        class="mr-2 bg-light p-1"
                        v-clipboard:copy="pool.safe.address"
                        v-clipboard:success="() => (isCopied = true)"
                    >
                        <strong>{{ pool.safe.address }}</strong>
                        <i class="fas ml-2" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                    </b-link>
                    to top up your pool.
                </p>
            </template>

            <form
                v-if="erc20.type === ERC20Type.Limited && erc20.adminBalance > 0"
                v-on:submit.prevent="submit"
                id="formDepositCreate"
            >
                <b-card bg-variant="light" class="border-0" body-class="p-5">
                    <b-input-group :append="erc20.symbol" :class="{ 'is-valid': amount <= erc20.adminBalance }">
                        <b-form-input type="number" v-model="amount" />
                    </b-input-group>
                    <small class="text-muted">
                        Your treasury holds
                        <strong>{{ erc20.adminBalance }} {{ erc20.symbol }} </strong>.
                        <b-link @click="amount = erc20.adminBalance">Set max amount</b-link>
                    </small>
                </b-card>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="loading || erc20.type !== ERC20Type.Limited"
                class="rounded-pill"
                type="submit"
                form="formDepositCreate"
                variant="primary"
                block
            >
                Top up {{ amount }} {{ erc20.symbol }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TPool } from '@thxnetwork/dashboard/store/modules/pools';
import { ERC20Type, type TERC20, type IERC20s } from '@thxnetwork/dashboard/types/erc20';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({
        pools: 'pools/all',
        erc20s: 'erc20/all',
    }),
})
export default class BaseModalDepositCreate extends Vue {
    loading = false;
    isCopied = false;
    chainInfo = chainInfo;
    error = '';
    amount = 0;
    erc20s!: IERC20s;
    ERC20Type = ERC20Type;

    @Prop() erc20!: TERC20;
    @Prop() pool!: TPool;

    onShow() {
        this.loading = true;
        this.amount = 0;
        this.error = '';
        this.$store.dispatch('erc20/read', this.erc20._id).then(async () => {
            this.loading = false;
        });
    }

    async submit() {
        if (!this.pool) return;

        this.loading = true;

        await this.$store.dispatch('pools/topup', {
            erc20: this.erc20,
            amount: this.amount,
            poolId: this.pool._id,
        });

        await this.$store.dispatch('pools/read', this.pool._id);
        this.$emit('submit');
        this.$bvModal.hide(`modalDepositCreate-${this.erc20._id}`);
        this.loading = false;
    }
}
</script>
<style lang="scss"></style>
