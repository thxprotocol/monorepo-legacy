<template>
    <base-card
        :is-loading="isLoading"
        :is-deploying="isDeploying"
        :body-bg-variant="erc721.archived ? 'light' : null"
        classes="cursor-pointer"
        @click="onClick"
    >
        <template #card-header>
            <base-badge-network v-if="!isLoading" :chainId="erc721.chainId" />
            <base-dropdown-menu-nft :erc721="erc721" @archive="archive" class="ml-auto" />
        </template>
        <template #card-body>
            <div class="mb-3 d-flex align-items-center">
                <base-identicon class="mr-2" size="40" :rounded="true" variant="darker" :uri="erc721.logoURI" />
                <div>
                    <strong class="m-0">{{ erc721.symbol }}</strong>
                    <br />
                    {{ erc721.name }}
                </div>
            </div>
            <p>
                <span class="text-muted">Total supply</span><br />
                <strong class="font-weight-bold h3 text-primary">
                    {{ erc721.totalSupply }}
                </strong>
            </p>
            <p>
                <span class="text-muted">Base URL</span><br />
                <b-badge variant="primary" class="mr-1 mb-1">
                    {{ erc721.baseURL }}
                </b-badge>
            </p>
            <p>
                <span class="text-muted">Properties</span><br />
                <b-badge
                    v-b-tooltip
                    :title="`${prop.description} (${prop.propType})`"
                    variant="primary"
                    class="mr-1 mb-1"
                    :key="key"
                    v-for="(prop, key) of erc721.properties"
                >
                    {{ prop.name }}
                </b-badge>
            </p>
            <b-button block variant="light" class="rounded-pill">Manage Metadata</b-button>
        </template>
    </base-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { ERC721Variant, type TERC721 } from '@thxnetwork/dashboard/types/erc721';
import poll from 'promise-poller';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseDropdownMenuNft from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenuNft.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';

@Component({
    components: {
        BaseModalPoolCreate,
        BaseCard,
        BaseBadgeNetwork,
        BaseIdenticon,
        BaseDropdownMenuNft,
    },
})
export default class BaseCardERC721 extends Vue {
    ERC721Variant = ERC721Variant;
    isLoading = true;
    isDeploying = false;
    error = '';

    @Prop() erc721!: TERC721;

    async mounted() {
        await this.$store.dispatch('erc721/read', this.erc721._id);

        if (!this.erc721.address) {
            this.isDeploying = true;
            this.waitForAddress();
        } else {
            this.isDeploying = false;
            this.isLoading = false;
        }
    }

    waitForAddress() {
        const taskFn = async () => {
            const erc721 = await this.$store.dispatch('erc721/read', this.erc721._id);
            if (erc721 && erc721.address.length) {
                this.isDeploying = false;
                this.isLoading = false;
                return Promise.resolve(erc721);
            } else {
                this.isLoading = false;
                return Promise.reject(erc721);
            }
        };

        poll({ taskFn, interval: 3000, retries: 10 });
    }

    onClick() {
        this.$router.push({ path: `/nft/${this.erc721._id}/metadata` });
    }

    openTokenUrl() {
        const url = `${chainInfo[this.erc721.chainId].blockExplorer}/token/${this.erc721.address}`;
        return (window as any).open(url, '_blank').focus();
    }

    async archive() {
        this.isLoading = true;
        await this.$store.dispatch('erc721/update', {
            erc721: this.erc721,
            data: { archived: !this.erc721.archived },
        });
        this.isLoading = false;
    }
}
</script>
