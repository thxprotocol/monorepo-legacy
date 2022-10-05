<template>
    <b-list-group-item v-if="membership && erc20" class="d-flex justify-content-between align-items-center">
        <div
            class="mr-auto d-flex align-items-center"
            v-b-tooltip
            :title="`${erc20.name} (${ChainId[membership.chainId]})`"
        >
            <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc20.logoURI" class="mr-2" />
            <strong>{{ erc20.symbol }}</strong>
        </div>
        <div class="h3 mr-3 m-0">
            {{ erc20.balance }}
        </div>
        <b-button variant="light" size="sm" @click.stop="$bvModal.show(`modalTransferTokens-${erc20.address}`)">
            <i class="fas fa-exchange-alt ml-0"></i>
        </b-button>
        <base-modal-transfer-tokens :membership="membership" :token="erc20" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { ERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import BaseModalTransferTokens from '@thxnetwork/wallet/components/modals/ModalTransferTokens.vue';
import { TNetworks } from '@thxnetwork/wallet/store/modules/network';
import { Membership } from '@thxnetwork/wallet/store/modules/memberships';
import BaseIdenticon from '../BaseIdenticon.vue';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        erc20s: 'erc20/all',
    }),
})
export default class BaseListGroupItemToken extends Vue {
    ChainId = ChainId;
    busy = true;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    erc20s!: { [id: string]: ERC20 };

    @Prop() membership!: Membership;

    get erc20() {
        return this.erc20s[this.membership.erc20Id];
    }

    mounted() {
        this.$store.dispatch('erc20/get', this.membership.erc20Id);
    }
}
</script>
