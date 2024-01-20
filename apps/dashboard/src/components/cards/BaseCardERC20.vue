<template>
    <b-card
        class="mb-3 shadow-sm"
        header-bg-variant="light"
        header-class="p-2 d-flex justify-content-between align-items-center"
    >
        <template #header>
            <base-badge-network v-if="!isLoading" :chainId="erc20.chainId" />
            <b-dropdown size="sm" variant="link" right no-caret toggle-class="d-flex align-items-center">
                <template #button-content>
                    <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
                </template>
                <b-dropdown-item @click.stop="remove"> Delete </b-dropdown-item>
            </b-dropdown>
        </template>
        <b-media class="mb-3">
            <template #aside>
                <BaseIdenticon class="mr-2" size="50" :rounded="true" variant="darker" :uri="erc20.logoImgUrl" />
            </template>
            <strong class="m-0">{{ erc20.symbol }}</strong>
            <br />
            {{ erc20.name }}
        </b-media>
        <b-form-group>
            <template #label>Address</template>
            <BaseAnchorAddress :chain-id="erc20.chainId" :address="erc20.address" />
        </b-form-group>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import type { TERC20 } from '@thxnetwork/dashboard/types/erc20';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import poll from 'promise-poller';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseAnchorAddress from '../BaseAnchorAddress.vue';

@Component({
    components: {
        BaseCard,
        BaseBadgeNetwork,
        BaseIdenticon,
        BaseAnchorAddress,
    },
})
export default class BaseCardERC20 extends Vue {
    ERC20Type = ERC20Type;
    isLoading = true;
    isDeploying = false;
    error = '';

    @Prop() erc20!: TERC20;

    async mounted() {
        if (!this.erc20.address) {
            this.isDeploying = true;
            this.waitForAddress();
        } else {
            this.isDeploying = false;
            this.isLoading = false;
        }
    }

    openTokenUrl() {
        const url = `${chainInfo[this.erc20.chainId].blockExplorer}/token/${this.erc20.address}`;
        return (window as any).open(url, '_blank').focus();
    }

    waitForAddress() {
        const taskFn = async () => {
            console.log(this.erc20);
            debugger;
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

    async remove() {
        this.isLoading = true;
        await this.$store.dispatch('erc20/remove', this.erc20);
        this.isLoading = false;
    }
}
</script>
