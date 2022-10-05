<template>
    <div v-if="profile">
        <div class="h-100 w-100 center-center" v-if="busy">
            <b-spinner variant="primary" />
        </div>
        <div class="h-100 d-flex flex-column" v-if="!busy && membership">
            <b-alert show dismissable variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <div class="mb-3 text-center">
                <strong>Available Swaps</strong>
            </div>
            <b-alert variant="info" show class="mb-3" v-if="!filteredERC20SwapRules.length">
                There are no Swap Rules set yet.
            </b-alert>
            <div class="mb-auto" v-else>
                <base-list-group-item-swap-rule
                    :membership="membership"
                    :swap-rule="swapRule"
                    :key="key"
                    v-for="(swapRule, key) of filteredERC20SwapRules"
                />
                <b-pagination
                    class="mt-3"
                    v-if="total > perPage"
                    @change="onChange"
                    v-model="currentPage"
                    :per-page="perPage"
                    :total-rows="total"
                    align="fill"
                ></b-pagination>
            </div>
            <b-button block variant="dark" to="/memberships" class="mx-3 w-auto m-md-0 mt-3">
                Back
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ISwapRules, TSwapRule } from '@thxnetwork/wallet/types/SwapRules';
import { IMemberships } from '@thxnetwork/wallet/store/modules/memberships';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import BaseListGroupItemSwapRule from '@thxnetwork/wallet/components/BaseListGroupItemSwapRule.vue';

@Component({
    components: {
        BaseListGroupItemSwapRule,
    },
    computed: mapGetters({
        profile: 'account/profile',
        swaprules: 'swaprules/all',
        memberships: 'memberships/all',
    }),
})
export default class MembershipERC20SwapRulesView extends Vue {
    busy = true;
    error = '';
    currentPage = 1;
    perPage = 10;
    total = 0;

    // getters
    profile!: UserProfile;
    swaprules!: ISwapRules;
    memberships!: IMemberships;

    get membership() {
        return this.memberships[this.$route.params.id];
    }

    get filteredERC20SwapRules() {
        if (!this.swaprules[this.$route.params.id]) return [];
        const result = Object.values(this.swaprules[this.$route.params.id]).filter(
            (swapRule: TSwapRule) => swapRule.page === this.currentPage,
        );
        return result;
    }

    async onChange(page: number) {
        const { pagination, error } = await this.$store.dispatch('swaprules/filter', {
            membership: this.membership,
            page,
            limit: this.perPage,
        });
        this.total = pagination?.total;
        this.error = error;
    }

    mounted() {
        this.$store.dispatch('memberships/get', this.$route.params.id).then(async () => {
            this.onChange(this.currentPage);
            this.busy = false;
            this.$store.dispatch('erc20/get', this.membership.erc20Id);
        });
    }
}
</script>
