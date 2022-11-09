<template>
    <div>
        <div class="container-xl">
            <b-jumbotron
                bg-variant="light"
                class="mt-3 jumbotron-header"
                :style="{
                    'min-height': 'none',
                    'border-radius': '1rem',
                    'background-size': 'cover',
                    'background-image': `url(${require('../../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <div class="container container-md py-5">
                    <p class="brand-text">Pools</p>
                    <b-button v-b-modal="`modalAssetPoolCreate`" class="rounded-pill" variant="secondary">
                        <i class="fas fa-plus mr-2"></i>
                        <span>Create Pool</span>
                    </b-button>
                    <b-button to="/tokens" variant="link" class="text-light">
                        <i class="fas fa-coins mr-2"></i>
                        <span>Create a token</span>
                    </b-button>
                    <b-button to="/nft" variant="link" class="text-light">
                        <i class="fas fa-palette mr-2"></i>
                        <span>Create an NFT</span>
                    </b-button>
                </div>
            </b-jumbotron>
        </div>
        <div class="container container-md">
            <b-row>
                <b-col class="text-right pb-3">
                    <base-btn-toggle-archive @archived="$store.dispatch('pools/list', { archived: $event })" />
                </b-col>
            </b-row>
            <base-list-state-empty
                v-if="!Object.values(pools).length"
                icon-class="fas fa-puzzle-piece"
                text-submit="Add a pool"
                title="You have not added a pool yet"
                description="Pools have a balance and you use them to send or receive tokens."
                @clicked="$bvModal.show('modalAssetPoolCreate')"
            />
            <div class="row" v-else>
                <div class="col-md-6 col-lg-4" :key="pool._id" v-for="pool of pools">
                    <base-card-pool :pool="pool" />
                </div>
            </div>
        </div>
        <base-modal-pool-create id="modalAssetPoolCreate" />
    </div>
</template>

<script lang="ts">
import BaseCardPool from '@thxnetwork/dashboard/components/cards/BaseCardPool.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import BaseListStateEmpty from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseBtnToggleArchive from '@thxnetwork/dashboard/components/buttons/BaseBtnToggleArchive.vue';

@Component({
    components: {
        BaseBtnToggleArchive,
        BaseListStateEmpty,
        BaseCardPool,
        BaseModalPoolCreate,
    },
    computed: mapGetters({
        profile: 'account/profile',
        pools: 'pools/all',
    }),
})
export default class Home extends Vue {
    profile!: IAccount;
    pools!: IPools;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    showAll = false;

    mounted() {
        this.$store.dispatch('account/getProfile');
        this.$store.dispatch('pools/list');
    }
}
</script>
