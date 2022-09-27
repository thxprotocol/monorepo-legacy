<template>
    <base-card :loading="isLoading" :is-deploying="isDeploying" classes="cursor-pointer" @click="openTokenUrl()">
        <template #card-header>
            {{ ERC20Type[erc20.type] }}
            <i class="ml-1 fas fa-archive text-white small" v-if="erc20.archived"></i>
        </template>
        <template #card-body v-if="erc20.name">
            <base-dropdown-token-menu :erc20="erc20" @archive="archive" />
            <base-badge-network class="mr-2" :chainId="erc20.chainId" />
            <div class="my-3 d-flex align-items-center" v-if="erc20.name">
                <base-identicon class="mr-2" size="40" :rounded="true" variant="darker" :uri="erc20.logoURI" />
                <div>
                    <strong class="m-0">{{ erc20.symbol }}</strong>
                    <br />
                    {{ erc20.name }}
                </div>
            </div>
            <p>
                <span class="text-muted">Total supply</span><br />
                <strong class="font-weight-bold h3 text-primary"> {{ erc20.totalSupply }} </strong>
            </p>
            <p class="m-0">
                <span class="text-muted">Treasury</span><br />
                <strong class="font-weight-bold h3 text-primary"> {{ erc20.adminBalance }} </strong>
            </p>
        </template>
    </base-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ERC20Type, TERC20 } from '@thxprotocol/dashboard/types/erc20';
import BaseCard from '@thxprotocol/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxprotocol/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxprotocol/dashboard/components/BaseIdenticon.vue';
import BaseDropdownTokenMenu from '@thxprotocol/dashboard/components/dropdowns/BaseDropdownMenuToken.vue';
import { chainInfo } from '@thxprotocol/dashboard/utils/chains';
import poll from 'promise-poller';

@Component({
    components: {
        BaseCard,
        BaseBadgeNetwork,
        BaseIdenticon,
        BaseDropdownTokenMenu,
    },
})
export default class BaseCardERC20 extends Vue {
    ERC20Type = ERC20Type;
    isLoading = true;
    isDeploying = false;
    error = '';

    @Prop() erc20!: TERC20;

    async mounted() {
        await this.$store.dispatch('erc20/read', this.erc20._id);

        if (!this.erc20.address) {
            this.isDeploying = true;
            this.waitForAddress();
        } else {
            this.isDeploying = false;
            this.isLoading = false;
        }
    }

    waitForAddress() {
        const taskFn = async () => {
            const erc20 = await this.$store.dispatch('erc20/read', this.erc20._id);
            if (erc20 && erc20.address.length) {
                this.isDeploying = false;
                this.isLoading = false;
                return Promise.resolve(erc20);
            } else {
                this.isLoading = false;
                return Promise.reject(erc20);
            }
        };

        poll({ taskFn, interval: 3000, retries: 10 });
    }

    openTokenUrl() {
        const url = `${chainInfo[this.erc20.chainId].blockExplorer}/token/${this.erc20.address}`;
        return (window as any).open(url, '_blank').focus();
    }

    async archive() {
        this.isLoading = true;
        this.$store.dispatch('erc20/update', { erc20: this.erc20, data: { archived: !this.erc20.archived } });
        this.isLoading = false;
    }
}
</script>
