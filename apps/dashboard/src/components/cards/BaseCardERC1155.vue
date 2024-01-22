<template>
    <base-card :is-loading="isLoading" :is-deploying="isDeploying" classes="cursor-pointer" @click="onClick">
        <template #card-header>
            <base-badge-network v-if="!isLoading" :chainId="erc1155.chainId" />
            <b-dropdown size="sm" variant="link" right no-caret toggle-class="d-flex align-items-center float-right">
                <template #button-content>
                    <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
                </template>
                <b-dropdown-item @click.stop="remove"> Remove </b-dropdown-item>
                <b-dropdown-item @click.stop="openTokenUrl"> Block Explorer </b-dropdown-item>
            </b-dropdown>
        </template>
        <template #card-body>
            <div class="mb-3 d-flex align-items-center">
                <base-identicon class="mr-2" size="40" :rounded="true" variant="darker" :uri="erc1155.logoURI" />
                <div>{{ erc1155.name }}</div>
            </div>
            <p>
                <span class="text-muted">Variant</span><br />
                <b-badge variant="primary" class="mr-1 mb-1">
                    {{ erc1155.variant && erc1155.variant.toUpperCase() }}
                </b-badge>
            </p>
            <p>
                <span class="text-muted">Base URL</span><br />
                <b-badge variant="primary" class="mr-1 mb-1">
                    {{ erc1155.baseURL }}
                </b-badge>
            </p>
            <b-button block variant="light" class="rounded-pill">Manage Metadata</b-button>
        </template>
    </base-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ERC1155Variant, type TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import poll from 'promise-poller';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseDropdownMenuNft from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenuNft.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';

@Component({
    components: {
        BaseModalPoolCreate,
        BaseCard,
        BaseBadgeNetwork,
        BaseIdenticon,
        BaseDropdownMenuNft,
    },
})
export default class BaseCardERC1155 extends Vue {
    ERC1155Variant = ERC1155Variant;
    isLoading = true;
    isDeploying = false;
    error = '';

    openTokenUrl() {
        const url = `${chainInfo[this.erc1155.chainId].blockExplorer}/token/${this.erc1155.address}`;
        return (window as any).open(url, '_blank').focus();
    }

    @Prop() erc1155!: TERC1155;

    async mounted() {
        await this.$store.dispatch('erc1155/read', this.erc1155._id);

        if (!this.erc1155.address) {
            this.isDeploying = true;
            this.waitForAddress();
        } else {
            this.isDeploying = false;
            this.isLoading = false;
        }
    }

    waitForAddress() {
        const taskFn = async () => {
            const erc1155 = await this.$store.dispatch('erc1155/read', this.erc1155._id);
            if (erc1155 && erc1155.address.length) {
                this.isDeploying = false;
                this.isLoading = false;
                return Promise.resolve(erc1155);
            } else {
                this.isLoading = false;
                return Promise.reject(erc1155);
            }
        };

        poll({ taskFn, interval: 3000, retries: 10 });
    }

    onClick() {
        this.$router.push({ path: `/nft/${this.erc1155.variant}/${this.erc1155._id}/metadata` });
    }

    async remove() {
        this.isLoading = true;
        await this.$store.dispatch('erc1155/remove', this.erc1155);
        this.isLoading = false;
    }
}
</script>
