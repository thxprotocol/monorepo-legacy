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
      <b-alert variant="info" show class="mb-3" v-if="!swapRulesByPage.length">
        There are no Swap Rules set yet.
      </b-alert>
      <div class="mb-auto" v-else>
        <base-list-group-item-swap-rule
          :membership="membership"
          :swap-rule="swapRule"
          :key="key"
          v-for="(swapRule, key) of swapRulesByPage"
        />
        <b-pagination
          class="mt-3"
          v-if="total > perPage"
          @change="onChange"
          v-model="page"
          :per-page="perPage"
          :total-rows="total"
          align="fill"
        ></b-pagination>
      </div>
      <b-button
        block
        variant="dark"
        to="/memberships"
        class="mx-3 w-auto m-md-0 mt-3"
      >
        Back
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { ISwapRules, TSwapRule } from '@thxnetwork/wallet/types/SwapRules';
import { IMemberships } from '@thxnetwork/wallet/store/modules/memberships';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import BaseListGroupItemSwapRule from '@thxnetwork/wallet/components/list-items/BaseListGroupItemSwapRule.vue';

@Component({
  components: {
    BaseListGroupItemSwapRule,
  },
  computed: {
    ...mapState('swaprules', ['totals']),
    ...mapGetters({
      profile: 'account/profile',
      swaprules: 'swaprules/all',
      memberships: 'memberships/all',
    }),
  },
})
export default class MembershipERC20SwapRulesView extends Vue {
  busy = true;
  error = '';
  page = 1;
  perPage = 10;

  // getters
  profile!: UserProfile;
  memberships!: IMemberships;

  get membership() {
    return this.memberships[this.$route.params.id];
  }

  swaprules!: ISwapRules;
  totals!: { [poolId: string]: number };

  get swapRulesByPage() {
    if (!this.swaprules[this.$route.params.id]) return [];
    return Object.values(this.swaprules[this.$route.params.id])
      .filter((client: TSwapRule) => client.page === this.page)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 5);
  }

  get total() {
    return this.totals[this.$route.params.id];
  }

  async onChange(page: number) {
    await this.$store.dispatch('swaprules/filter', {
      membership: this.membership,
      page,
      limit: this.perPage,
    });
  }

  mounted() {
    this.$store
      .dispatch('memberships/get', this.$route.params.id)
      .then(async () => {
        this.onChange(this.page);
        this.busy = false;
        this.$store.dispatch('erc20/getContract', this.membership.erc20Id);
      });
  }
}
</script>
