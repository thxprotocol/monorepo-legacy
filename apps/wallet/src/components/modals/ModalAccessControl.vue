<template>
    <b-modal v-if="profile" :id="'modalAccessControl'" centered scrollable title="Access Control" @show="onShow">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-list-group class="w-100 align-self-start" v-if="managers.length">
                <base-list-group-item-wallet-manager :walletManager="w" :key="key" v-for="(w, key) of managers" />
            </b-list-group>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { IWalletManagers, TWalletManager } from '@thxnetwork/wallet/types/WalletManagers';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ChainId } from '../../types/enums/ChainId';
import { TWallet } from '../../types/Wallet';
import BaseListGroupItemWalletManager from '../list-items/BaseListGroupItemWalletManager.vue';

@Component({
    components: {
        BaseListGroupItemWalletManager,
    },
    computed: {
        ...mapGetters({
            chainId: 'network/chainId',
            profile: 'account/profile',
            wallet: 'walletManagers/wallet',
            walletManagers: 'walletManagers/all',
        }),
    },
})
export default class BaseModalAccessControl extends Vue {
    // getters
    profile!: UserProfile;
    chainId!: ChainId;
    wallet!: TWallet;
    walletManagers!: IWalletManagers;
    walletManager: TWalletManager | null = null;

    busy = false;

    get managers() {
        if (!this.wallet || !this.walletManagers[this.wallet._id]) {
            return [];
        }
        return Object.values(this.walletManagers[this.wallet._id]);
    }

    async onShow() {
        await this.$store.dispatch('walletManagers/getWallet', this.chainId);
        if (this.wallet) {
            await this.$store.dispatch('walletManagers/list', this.wallet);
        }
    }
}
</script>
