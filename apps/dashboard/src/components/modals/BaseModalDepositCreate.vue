<template>
    <base-modal
        size="lg"
        :title="`Top up a pool with ${pool.erc20.symbol}`"
        :id="`modalDepositCreate-${pool.erc20._id}`"
        @show="onShow"
        :loading="loading"
        :error="error"
    >
        <template #modal-body v-if="!loading && erc20">
            <b-alert v-if="pool.erc20.type === ERC20Type.Unlimited" variant="info" show>
                <i class="fas fa-info-circle mr-2"></i>
                <strong>No need to top up your pool!</strong> Tokens will be minted when they are needed.
            </b-alert>
            <b-alert variant="warning" show v-if="pool.erc20.type === ERC20Type.Unknown">
                <i class="fas fa-info-circle mr-2"></i>
                <strong>It seems we have not deployed this contract.</strong>
                Transfer {{ pool.erc20.symbol }} to <strong>{{ pool.address }}</strong>
                <a v-clipboard:copy="pool.address"><i class="fas fa-clipboard"></i></a> to top up your pool.
            </b-alert>
            <form
                v-if="pool.erc20.type === ERC20Type.Limited && erc20.adminBalance > 0"
                v-on:submit.prevent="submit"
                id="formDepositCreate"
            >
                <b-card bg-variant="light" class="border-0" body-class="p-5">
                    <b-input-group :append="erc20.symbol" :class="{ 'is-valid': amount <= erc20.adminBalance }">
                        <b-form-input type="number" v-model="amount" />
                    </b-input-group>
                    <small class="text-muted">
                        Your treasury holds <strong>{{ erc20.adminBalance }} {{ erc20.symbol }} </strong>.
                        <b-link @click="amount = erc20.adminBalance">Set max amount</b-link>
                    </small>
                </b-card>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="loading || pool.erc20.type !== ERC20Type.Limited"
                class="rounded-pill"
                type="submit"
                form="formDepositCreate"
                variant="primary"
                block
            >
                Top up {{ amount }} {{ pool.erc20.symbol }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { ERC20Type, IERC20s } from '@thxnetwork/dashboard/types/erc20';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';

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
    error = '';
    amount = 0;
    erc20s!: IERC20s;
    ERC20Type = ERC20Type;

    @Prop() pool!: IPool;

    get erc20() {
        return this.erc20s[this.pool.erc20._id];
    }

    onShow() {
        this.loading = true;
        this.amount = 0;
        this.error = '';
        this.$store.dispatch('erc20/read', this.pool.erc20._id).then(async () => {
            this.loading = false;
        });
    }

    async submit() {
        if (!this.pool) return;

        this.loading = true;

        await this.$store.dispatch('pools/topup', {
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
