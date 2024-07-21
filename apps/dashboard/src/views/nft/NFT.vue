<template>
    <div class="container container-md pt-5" v-if="nft">
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import { NFTVariant } from '@thxnetwork/common/enums';
import { IERC1155s } from '@thxnetwork/dashboard/types/erc1155';

@Component({
    computed: mapGetters({
        erc721s: 'erc721/all',
        erc1155s: 'erc1155/all',
        account: 'account/profile',
    }),
})
export default class PoolView extends Vue {
    account!: TAccount;
    erc721s!: IERC721s;
    erc1155s!: IERC1155s;

    get nft() {
        switch (this.$route.params.variant) {
            case NFTVariant.ERC721:
                return this.erc721s[this.$route.params.nftId];
            case NFTVariant.ERC1155:
                return this.erc1155s[this.$route.params.nftId];
        }
    }

    async mounted() {
        this.$store.dispatch('account/getProfile');

        switch (this.$route.params.variant) {
            case NFTVariant.ERC721:
                await this.$store.dispatch('erc721/read', this.$route.params.nftId);
                break;
            case NFTVariant.ERC1155:
                this.$store.dispatch('erc1155/read', this.$route.params.nftId);
                break;
        }
    }
}
</script>
