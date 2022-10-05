<template>
    <b-list-group-item v-if="membership && erc721">
        <div class="d-flex justify-content-between align-items-center" v-b-toggle="`collapse-${membership._id}`">
            <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="erc721.name">
                <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc721.logoURI" class="mr-2" />
                <strong class="mr-2">{{ erc721.symbol }}</strong>
                <b-badge variant="primary">NFT</b-badge>
            </div>
            <div class="h3 mr-3 m-0">
                {{ erc721.balance }}
            </div>
        </div>
        <b-collapse :id="`collapse-${membership._id}`" class="mt-2">
            <hr />
            <base-card-erc-721-token
                :erc721="erc721"
                :token="token"
                :key="token._id"
                v-for="token of membership.tokens"
            />
        </b-collapse>
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { ERC721 } from '@thxnetwork/wallet/store/modules/erc721';
import { TNetworks } from '@thxnetwork/wallet/store/modules/network';
import { Membership } from '@thxnetwork/wallet/store/modules/memberships';
import BaseModalTransferTokens from '@thxnetwork/wallet/components/modals/ModalTransferTokens.vue';
import BaseCardErc721Token from '@thxnetwork/wallet/components/BaseCardERC721Token.vue';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
    components: {
        BaseCardErc721Token,
        BaseModalTransferTokens,
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        erc721s: 'erc721/all',
    }),
})
export default class BaseListGroupItemNFT extends Vue {
    busy = true;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    erc721s!: { [id: string]: ERC721 };

    get erc721() {
        return this.erc721s[this.membership.erc721Id];
    }

    @Prop() membership!: Membership;

    mounted() {
        this.$store.dispatch('erc721/get', this.membership.erc721Id);
    }
}
</script>
