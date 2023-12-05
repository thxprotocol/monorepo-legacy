<template>
    <base-card :is-loading="isLoading" :is-deploying="isDeploying" :body-bg-variant="erc20.archived ? 'light' : null">
        <template #card-header>
            <base-badge-network v-if="!isLoading" :chainId="erc20.chainId" />
            <base-dropdown-token-menu :erc20="erc20" @archive="archive" class="ml-auto" />
        </template>
        <template #card-body>
            <div class="mb-3 d-flex align-items-center" v-if="erc20.name">
                <base-identicon class="mr-2" size="40" :rounded="true" variant="darker" :uri="erc20.logoImgUrl" />
                <div>
                    <strong class="m-0">{{ erc20.symbol }}</strong>
                    <br />
                    {{ erc20.name }}
                </div>
            </div>
            <!-- <p>
                <span class="text-muted">Total supply</span><br />
                <strong class="font-weight-bold h3 text-primary">
                    {{ erc20.totalSupply }}
                </strong>
            </p> -->
            <!-- <p class="m-0">
                <span class="text-muted">Treasury</span><br />
                <strong class="font-weight-bold h3 text-primary">
                    {{ erc20.adminBalance }}
                </strong>
            </p> -->
        </template>
    </base-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import type { TERC20 } from '@thxnetwork/dashboard/types/erc20';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseDropdownTokenMenu from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenuToken.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';

import poll from 'promise-poller';

@Component({
    components: {
        BaseModalPoolCreate,
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

    async archive() {
        this.isLoading = true;
        this.$store.dispatch('erc20/update', {
            erc20: this.erc20,
            data: { archived: !this.erc20.archived },
        });
        this.isLoading = false;
    }
}
</script>
