<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <div v-if="erc20" class="mr-auto d-flex align-items-center" v-b-tooltip :title="`${erc20.name}`">
            <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc20.logoURI" class="mr-2" />
            <strong>{{ erc20.symbol }}</strong>
        </div>
        <b-button variant="light" size="sm" @click.stop="$bvModal.show(`modalERC20Swap-${swapRule._id}`)">
            <i class="fas fa-sync ml-0"></i>
        </b-button>
        <BaseModalERC20Swap :swap-rule="swapRule" :membership="membership" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from './BaseIdenticon.vue';
import { Membership } from '@thxnetwork/wallet/store/modules/memberships';
import BaseModalERC20Swap from './modals/ModalSwap.vue';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { TSwapRule } from '@thxnetwork/wallet/types/SwapRules';
import { IERC20s } from '@thxnetwork/wallet/store/modules/erc20';

@Component({
    components: {
        BaseModalERC20Swap,
        BaseIdenticon,
    },
    computed: mapGetters({
        erc20s: 'erc20/all',
    }),
})
export default class BaseListGroupItemSwapRule extends Vue {
    ChainId = ChainId;
    erc20s!: IERC20s;

    @Prop() swapRule!: TSwapRule;
    @Prop() membership!: Membership;

    get erc20() {
        return this.erc20s[this.swapRule.tokenInId];
    }

    mounted() {
        this.$store.dispatch('erc20/getContract', this.swapRule.tokenInId);
    }
}
</script>
