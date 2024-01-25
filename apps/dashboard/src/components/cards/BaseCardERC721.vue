<template>
    <b-card
        class="mb-3 shadow-sm"
        header-bg-variant="light"
        header-class="p-2 d-flex justify-content-between align-items-center"
    >
        <template #header>
            <div class="d-flex">
                <BaseBadgeNetwork class="mr-1" v-if="!isLoading" :chainId="erc721.chainId" />
                <b-badge variant="light" class="p-2" v-if="isOwner">
                    <i class="fas fa-user mr-1" />
                    Owner
                </b-badge>
            </div>
            <b-dropdown
                v-if="isOwner"
                size="sm"
                variant="link"
                right
                no-caret
                toggle-class="d-flex align-items-center float-right"
            >
                <template #button-content>
                    <i class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted" aria-hidden="true" style="font-size: 1rem"></i>
                </template>
                <b-dropdown-item @click="onClickMetadata"> Metadata </b-dropdown-item>
                <b-dropdown-item @click="onClickDelete"> Delete </b-dropdown-item>
            </b-dropdown>
        </template>
        <b-media class="mb-3">
            <template #aside>
                <base-identicon class="mr-2" size="45" :rounded="true" variant="darker" :uri="erc721.logoURI" />
            </template>
            <strong class="m-0">{{ erc721.symbol }}</strong>
            <br />
            {{ erc721.name }}
        </b-media>
        <b-form-group label-class="text-muted pb-1" label="Variant">
            <b-badge variant="primary" class="mr-1 mb-1"> ERC721 </b-badge>
        </b-form-group>
        <b-form-group label-class="text-muted pb-1" label="Total supply">
            {{ erc721.totalSupply }}
        </b-form-group>
        <b-form-group label-class="text-muted pb-1" label="Address">
            <BaseAnchorAddress :chain-id="erc721.chainId" :address="erc721.address" />
        </b-form-group>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ERC721Variant, type TERC721 } from '@thxnetwork/dashboard/types/erc721';
import poll from 'promise-poller';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import BaseDropdownMenuNft from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenuNft.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { mapGetters } from 'vuex';
import BaseAnchorAddress from '../BaseAnchorAddress.vue';
import { TAccount } from '@thxnetwork/common/lib/types/interfaces';

@Component({
    components: {
        BaseModalPoolCreate,
        BaseCard,
        BaseBadgeNetwork,
        BaseIdenticon,
        BaseDropdownMenuNft,
        BaseAnchorAddress,
    },
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class BaseCardERC721 extends Vue {
    ERC721Variant = ERC721Variant;
    isLoading = true;
    isDeploying = false;
    error = '';
    account!: TAccount;

    @Prop() erc721!: TERC721;

    get isOwner() {
        if (!this.account) return;
        return this.erc721.sub === this.account.sub;
    }

    openTokenUrl() {
        const url = `${chainInfo[this.erc721.chainId].blockExplorer}/token/${this.erc721.address}`;
        return (window as any).open(url, '_blank').focus();
    }

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

    onClickMetadata() {
        this.$router.push({ path: `/nft/${this.erc721.variant}/${this.erc721._id}` });
    }

    async onClickDelete() {
        this.isLoading = true;
        await this.$store.dispatch('erc721/remove', this.erc721);
        this.isLoading = false;
    }
}
</script>
