<template>
    <b-modal v-if="profile" :id="'modalAccessControl'" centered scrollable title="Access Control" @show="onShow">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <b-list-group class="w-auto align-self-start" v-if="managers.length">
                <base-list-group-item-wallet-manager
                    :walletManager="w"
                    :key="key"
                    v-for="(w, key) of managers"
                    @delete="remove"
                />
            </b-list-group>

            <b-form-group v-if="managers.length < MAX_MANAGERS_PER_WALLET">
                <b-form-group label="Add a new Wallet Manager" label-class="text-muted">Address</b-form-group>
                <b-form-input autofocus size="lg" v-model="managerAddress" placeholder="0x00..." />

                <b-button
                    :disabled="!canAddNewManagers"
                    class="mt-3 btn-rounded"
                    block
                    variant="primary"
                    type="submit"
                    @click="submit"
                    >Add</b-button
                >
            </b-form-group>
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
    MAX_MANAGERS_PER_WALLET = 3;
    walletManagers!: IWalletManagers;
    walletManager: TWalletManager | null = null;

    managerAddress = '';
    busy = false;

    get managers() {
        if (!this.wallet || !this.walletManagers[this.wallet._id]) {
            return [];
        }
        return Object.values(this.walletManagers[this.wallet._id]);
    }

    get canAddNewManagers() {
        return this.managerAddress.length == 42 && this.managers.length < this.MAX_MANAGERS_PER_WALLET;
    }

    async onShow() {
        this.busy = true;
        await this.$store.dispatch('walletManagers/getWallet', this.chainId);
        if (this.wallet) {
            await this.$store.dispatch('walletManagers/list', this.wallet);
        }
        this.busy = false;
    }

    async submit() {
        if (!this.canAddNewManagers) {
            return false;
        }
        this.busy = true;
        await this.$store.dispatch('walletManagers/create', { wallet: this.wallet, address: this.managerAddress });
        await this.$store.dispatch('walletManagers/list', this.wallet);
        this.managerAddress = '';
        this.busy = false;
        return true;
    }

    async remove(walletManager: TWalletManager) {
        this.busy = true;
        await this.$store.dispatch('walletManagers/remove', walletManager);
        await this.$store.dispatch('walletManagers/list', this.wallet);
        this.busy = false;
    }
}
</script>
