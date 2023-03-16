<template>
    <b-form-group class="mb-0">
        <hr />
        <div class="row" v-if="erc20">
            <div class="col-md-6 d-flex align-items-center">
                <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="`${erc20.name}`">
                    <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc20.logoURI" class="mr-2" />
                    <strong>{{ erc20.symbol }}</strong>
                </div>
            </div>
            <div class="align-items-right">
                {{ swapRule.tokenMultiplier }}
            </div>
        </div>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type { IERC20s } from '@thxnetwork/dashboard/types/erc20';
import type { TERC20SwapRule } from '@thxnetwork/dashboard/types/IERC20SwapRules';
import BaseIdenticon from '@thxnetwork/dashboard/components/BaseIdenticon.vue';
import type { TPool } from '@thxnetwork/types/index';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        pools: 'pools/all',
        erc20s: 'erc20/all',
    }),
})
export default class BaseFormGroupSwapRule extends Vue {
    erc20s!: IERC20s;

    @Prop() pool!: TPool;
    @Prop() swapRule!: TERC20SwapRule;

    get erc20() {
        return this.erc20s[this.swapRule.tokenInId];
    }

    mounted() {
        this.$store.dispatch('erc20/read', this.swapRule.tokenInId);
    }
}
</script>
