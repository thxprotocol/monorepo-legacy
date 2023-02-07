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
                    <p class="brand-text">Commerce</p>
                    <b-button v-b-modal="'modalMerchantCreate'" class="rounded-pill" variant="secondary">
                        <i class="fas fa-plus mr-2"></i>
                        <span class="mr-2">Create Merchant</span>
                    </b-button>
                </div>
            </b-jumbotron>
        </div>
        <div class="container container-md">//</div>
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
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';

@Component({
    components: {
        BaseBtnToggleArchive,
        BaseCardErc721,
        ModalErc721Create,
        BaseNothingHere,
        BaseModalPoolCreate,
    },
    computed: mapGetters({
        erc721s: 'erc721/all',
    }),
})
export default class NFTView extends Vue {
    erc721s!: IERC721s;

    loadList() {
        this.$store.dispatch('erc721/list');
    }

    mounted() {
        this.$store.dispatch('account/getProfile');
        this.loadList();
    }
}
</script>
