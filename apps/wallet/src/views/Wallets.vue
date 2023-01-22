<template>
    <div v-if="profile" class="d-flex align-items-center justify-content-center">
        <b-spinner variant="primary" class="m-auto" v-if="loading" />
        <template v-else>
            <b-list-group class="w-100 align-self-start">
                <b-alert variant="info" show>
                    <i class="fas fa-info-circle mr-2"></i> This list shows the addresses for your account.
                </b-alert>
                <b-list-group-item
                    :href="chainInfo[chainId].blockExplorer + '/address/' + profile.address"
                    class="d-flex align-items-center"
                >
                    <img
                        v-if="profile.variant === 4"
                        class="mr-2"
                        height="18"
                        :src="require('../../public/assets/img/mm-logo.svg')"
                        :alt="`Metamask logo`"
                    />
                    <img
                        v-else
                        class="mr-2"
                        height="18"
                        :src="require('../../public/assets/img/logo.png')"
                        :alt="`Metamask logo`"
                    />
                    <div class="text-overflow-75">
                        {{ profile.address }}
                    </div>
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
                </b-list-group-item>
                <b-list-group-item :href="chainInfo[wallet.chainId].blockExplorer + '/address/' + wallet.address">
                    <b-row>
                        <b-col md="8" class="d-flex align-items-center">
                            <img
                                class="mr-2"
                                height="18"
                                :src="chainInfo[wallet.chainId].logo"
                                :alt="`${chainInfo[wallet.chainId].name}
                            logo`"
                            />
                            <div class="text-overflow-75">
                                {{ wallet.address }}
                            </div>
                            <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
                        </b-col>
                        <b-col md="4" class="text-muted text-right small">
                            {{ format(new Date(wallet.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </b-col>
                    </b-row>
                </b-list-group-item>
            </b-list-group>
        </template>
    </div>
</template>

<script lang="ts">
import BaseListGroupItemToken from '@thxnetwork/wallet/components/list-items/BaseListGroupItemToken.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { IERC20s } from '@thxnetwork/wallet/store/modules/erc20';
import { ChainId } from '../types/enums/ChainId';
import { TWallet } from '../types/Wallet';
import { format } from 'date-fns';
import { chainInfo } from '../utils/chains';

@Component({
    components: {
        BaseListGroupItemToken,
    },
    computed: {
        ...mapState('erc20', ['contracts']),
        ...mapGetters({
            profile: 'account/profile',
            chainId: 'network/chainId',
            wallet: 'walletManagers/wallet',
        }),
    },
})
export default class Wallets extends Vue {
    chainInfo = chainInfo;
    format = format;
    loading = true;
    contracts!: IERC20s;
    profile!: UserProfile;
    chainId!: ChainId;
    wallet!: TWallet;

    mounted() {
        this.$store.dispatch('walletManagers/getWallet', { sub: this.profile.sub, chainId: this.chainId }).then(() => {
            this.loading = false;
        });
    }
}
</script>
