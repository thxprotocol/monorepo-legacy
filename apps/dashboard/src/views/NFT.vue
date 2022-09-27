<template>
    <div>
        <b-jumbotron
            class="jumbotron-header text-left"
            :style="{
                'background-image': `url(${require('../../public/assets/thx_jumbotron.webp')})`,
            }"
        >
            <div class="container container-md pt-5 pb-5">
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
                <b-button to="/pools" variant="link" class="text-light">
                    <i class="fas fa-chart-pie mr-2"></i>
                    <span>Deploy an NFT pool</span>
                </b-button>
            </div>
        </b-jumbotron>
        <div class="container container-md">
            <b-row>
                <b-col class="text-right pb-3">
                    <base-btn-toggle-archive @archived="$store.dispatch('erc721/list', { archived: $event })" />
                </b-col>
            </b-row>
            <base-nothing-here
                v-if="!Object.values(erc721s).length"
                text-submit="Create an NFT"
                title="You have not created an NFT yet"
                description="NFT's could be used for creating digital art collections, certificates
                of authenticity, in-game loot and social status."
                @clicked="$bvModal.show('modalERC721Create')"
            />
            <b-row v-else>
                <b-col md="6" lg="4" :key="erc721._id" v-for="erc721 of erc721s">
                    <base-card-erc721 :erc721="erc721" />
                </b-col>
            </b-row>
        </div>
        <modal-erc721-create />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import ModalErc721Create from '@thxnetwork/dashboard/components/modals/BaseModalERC721Create.vue';
import BaseCardErc721 from '@thxnetwork/dashboard/components/cards/BaseCardERC721.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import BaseBtnToggleArchive from '@thxnetwork/dashboard/components/buttons/BaseBtnToggleArchive.vue';

@Component({
    components: {
        BaseBtnToggleArchive,
        BaseCardErc721,
        ModalErc721Create,
        BaseNothingHere,
    },
    computed: mapGetters({
        erc721s: 'erc721/all',
    }),
})
export default class NFTView extends Vue {
    erc721s!: IERC721s;

    mounted() {
        this.$store.dispatch('account/getProfile');
        this.$store.dispatch('erc721/list');
    }
}
</script>
