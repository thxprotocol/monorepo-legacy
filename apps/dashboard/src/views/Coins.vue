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
                    'background-image': `url(${require('@thxnetwork/dashboard/../../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <div class="container container-md py-5">
                    <p class="brand-text">Coins</p>
                    <b-button
                        v-b-modal="'modalERC20Create'"
                        class="rounded-pill mr-2"
                        variant="secondary"
                        v-b-tooltip
                        title="The fungible token standard ERC-20 could be used for making payments, exchanging value, point systems
                and reputation metrics."
                    >
                        <i class="fas fa-plus mr-2"></i>
                        <span>Create Coin</span>
                    </b-button>
                    <b-button
                        v-b-modal="'modalERC20Import'"
                        variant="link"
                        class="text-light"
                        v-b-tooltip
                        title="Import an existing ERC20 token contract, top up your pool and manage the distribution."
                    >
                        <i class="fas fa-arrow-down mr-2"></i>
                        <span>Import Coin</span>
                    </b-button>
                </div>
            </b-jumbotron>
        </div>
        <div class="container container-md">
            <base-nothing-here
                v-if="!Object.values(erc20List).length"
                text-submit="Create a Coin"
                title="You have not created a Coin yet"
                description="Coins could be used for making payments, exchanging value, point systems
                and reputation metrics."
                @clicked="$bvModal.show('modalERC20Create')"
            />
            <b-row v-else>
                <b-col md="6" lg="4" :key="key" v-for="(erc20, key) of erc20List">
                    <BaseCardERC20 :erc20="erc20" />
                </b-col>
            </b-row>
        </div>
        <ModalERC20Create />
        <ModalERC20Import />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IERC20s } from '@thxnetwork/dashboard/types/erc20';
import ModalERC20Create from '@thxnetwork/dashboard/components/modals/BaseModalERC20Create.vue';
import ModalERC20Import from '@thxnetwork/dashboard/components/modals/BaseModalERC20Import.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import BaseBtnToggleArchive from '@thxnetwork/dashboard/components/buttons/BaseBtnToggleArchive.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import BaseCardERC20 from '@thxnetwork/dashboard/components/cards/BaseCardERC20.vue';

@Component({
    components: {
        BaseBtnToggleArchive,
        BaseCardERC20,
        ModalERC20Create,
        ModalERC20Import,
        BaseNothingHere,
        BaseModalPoolCreate,
    },
    computed: mapGetters({
        erc20List: 'erc20/all',
    }),
})
export default class CoinsView extends Vue {
    erc20List!: IERC20s;

    loadList() {
        this.$store.dispatch('erc20/list');
    }

    mounted() {
        this.$store.dispatch('account/getProfile');
        this.loadList();
    }
}
</script>
