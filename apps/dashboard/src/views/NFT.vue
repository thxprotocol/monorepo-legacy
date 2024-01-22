<template>
    <div>
        <div class="container-xl">
            <b-jumbotron
                class="mt-3 jumbotron-header"
                bg-variant="light"
                :style="{
                    'min-height': 'none',
                    'border-radius': '1rem',
                    'background-size': 'cover',
                    'background-image': `url(${require('../../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <div class="container container-md py-5">
                    <p class="brand-text">NFT</p>
                    <b-button
                        v-b-modal="'modalERC721Create'"
                        class="rounded-pill"
                        variant="secondary"
                        v-b-tooltip
                        title="The non-fungible token standard ERC-721 could be used for creating digital art collections, certificates
                of authenticity, in-game loot and social status."
                    >
                        <i class="fas fa-plus mr-2"></i>
                        <span class="mr-2">Create NFT</span>
                    </b-button>
                    <b-button
                        v-b-modal="'modalNftImport'"
                        variant="link"
                        class="text-light"
                        v-b-tooltip
                        title="Transfer tokens to your pool and import an existing ERC721 or ERC1155 token contract."
                    >
                        <i class="fas fa-arrow-down mr-2"></i>
                        <span>Import NFT</span>
                    </b-button>
                </div>
            </b-jumbotron>
        </div>
        <div class="container container-md">
            <base-nothing-here
                v-if="!Object.values(erc721s).length && !Object.values(erc1155s).length"
                text-submit="Create an NFT"
                title="You have not created an NFT yet"
                description="NFT's could be used for creating digital art collections, certificates
                of authenticity, in-game loot and social status."
                @clicked="$bvModal.show('modalERC721Create')"
            />
            <b-row v-else>
                <b-col md="6" lg="4" :key="erc721._id" v-for="erc721 of erc721s">
                    <BaseCardERC721 :erc721="erc721" />
                </b-col>
                <b-col md="6" lg="4" :key="erc1155._id" v-for="erc1155 of erc1155s">
                    <BaseCardERC1155 :erc1155="erc1155" />
                </b-col>
            </b-row>
        </div>

        <modal-erc721-create />
        <base-modal-nft-import />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import ModalErc721Create from '@thxnetwork/dashboard/components/modals/BaseModalERC721Create.vue';
import BaseCardERC721 from '@thxnetwork/dashboard/components/cards/BaseCardERC721.vue';
import BaseCardERC1155 from '@thxnetwork/dashboard/components/cards/BaseCardERC1155.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import BaseBtnToggleArchive from '@thxnetwork/dashboard/components/buttons/BaseBtnToggleArchive.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import BaseModalNftImport from '@thxnetwork/dashboard/components/modals/BaseModalNftImport.vue';
import { IERC1155s } from '../types/erc1155';

@Component({
    components: {
        BaseBtnToggleArchive,
        BaseCardERC721,
        BaseCardERC1155,
        ModalErc721Create,
        BaseNothingHere,
        BaseModalPoolCreate,
        BaseModalNftImport,
    },
    computed: mapGetters({
        erc721s: 'erc721/all',
        erc1155s: 'erc1155/all',
    }),
})
export default class NFTView extends Vue {
    erc721s!: IERC721s;
    erc1155s!: IERC1155s;

    mounted() {
        this.$store.dispatch('account/getProfile');
        this.$store.dispatch('erc721/list');
        this.$store.dispatch('erc1155/list');
    }
}
</script>
