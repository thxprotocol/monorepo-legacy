<template>
    <b-dropdown size="sm" variant="darker" no-caret v-if="profile" toggle-class="mr-2 px-3">
        <template #button-content>
            <div v-if="chain" class="d-flex align-items-center" style="height: 32px">
                <img :src="chain.logo" width="15" class="mr-md-2" alt="" />
                <span class="d-none d-md-block text-muted">
                    {{ chain.name }}
                </span>
            </div>
        </template>
        <b-dropdown-item-btn
            v-for="chain in chains"
            :key="chain.chainId"
            @click="onSelectChain(chain.chainId)"
            button-class="d-flex justify-content-between"
        >
            <div class="flex-grow">
                <img :src="chain.logo" width="15" class="mr-2" alt="" />
                {{ chain.name }}
            </div>
            <b-link
                class="text-muted ml-3"
                @click.stop="goTo(`${chain.blockExplorer}/address/${profile.address}`)"
                target="_blank"
            >
                <i class="fas fa-external-link-alt" style="font-size: 0.8rem"></i>
            </b-link>
        </b-dropdown-item-btn>
    </b-dropdown>
</template>
<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { ChainInfo } from '@thxnetwork/wallet/types/ChainInfo';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import Web3 from 'web3';
import { fromWei } from 'web3-utils';

@Component({
    computed: {
        ...mapState('network', ['web3']),
        ...mapGetters({
            chainId: 'network/chainId',
            chains: 'network/chains',
            profile: 'account/profile',
        }),
    },
})
export default class BaseNetworkSelect extends Vue {
    chain: ChainInfo | null = null;
    balance = 0;

    web3!: Web3;
    profile!: UserProfile;
    chains!: ChainInfo[];
    chainId!: ChainId;

    async mounted() {
        await this.onSelectChain(this.chainId);
        this.chain = chainInfo[this.chainId];
        this.getBalance();
    }

    async onSelectChain(chainId: ChainId) {
        const currentChainId = this.chainId;
        // Set a new web3 instance and update chainId
        await this.$store.dispatch('network/connect', chainId);

        if (currentChainId && currentChainId !== chainId) {
            window.location.reload();
        }
    }

    async getBalance() {
        this.balance = Number(fromWei(await this.web3.eth.getBalance(this.profile.address)));
    }

    goTo(url: string) {
        window.open(url, '_blank');
    }
}
</script>
