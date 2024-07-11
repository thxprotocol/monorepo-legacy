<template>
    <b-dropdown
        variant="light"
        toggle-class="form-control d-flex align-items-center justify-content-between"
        menu-class="w-100"
        class="w-100"
    >
        <template #button-content>
            <div v-if="wallet">{{ wallet.address }}</div>
            <div v-else>Select wallet</div>
        </template>
        <b-dropdown-item-button :disabled="!w.address" :key="w._id" v-for="w of wallets" @click="$emit('selected', w)">
            {{ w.address }} ({{ w.chainId }})
        </b-dropdown-item-button>
        <template v-if="pool">
            <b-dropdown-divider />
            <b-dropdown-item :to="`/pool/${pool._id}/settings/wallets`" link-class="d-flex align-items-center">
                Create a wallet <i class="fas fa-chevron-right ml-auto" />
            </b-dropdown-item>
        </template>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPools, TWalletState } from '../../store/modules/pools';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        poolList: 'pools/all',
        walletList: 'pools/wallets',
    }),
})
export default class BaseDropdownSelectWallet extends Vue {
    poolList!: IPools;
    walletList!: TWalletState;
    loading = false;

    @Prop() pool!: TPool;
    @Prop() wallet!: TWallet;

    async mounted() {
        if (!this.pool) {
            await Promise.all(
                Object.values(this.poolList).map((pool) => this.$store.dispatch('pools/listWallets', { pool })),
            );
        } else {
            this.$store.dispatch('pools/listWallets', { pool: this.pool });
        }
    }

    get wallets() {
        return this.pool ? this.walletList[this.pool._id] : Object.values(this.walletList).flat();
    }
}
</script>
