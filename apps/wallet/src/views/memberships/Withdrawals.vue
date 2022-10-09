<template>
  <div>
    <div class="h-100 w-100 center-center" v-if="busy">
      <b-spinner variant="primary" />
    </div>
    <div class="h-100 d-flex flex-column" v-if="!busy && membership && erc20">
      <b-alert show dismissable variant="danger" v-if="error">
        {{ error }}
      </b-alert>
      <div class="mb-3 text-right">
        <b-button-group>
          <b-button
            size="sm"
            :variant="state === WithdrawalState.Pending ? 'secondary' : 'dark'"
            @click="onChange(membership, currentPage, WithdrawalState.Pending)"
          >
            Pending
          </b-button>
          <b-button
            :variant="
              state === WithdrawalState.Withdrawn ? 'secondary' : 'dark'
            "
            size="sm"
            @click="
              onChange(membership, currentPage, WithdrawalState.Withdrawn)
            "
          >
            Withdrawn
          </b-button>
          <b-button
            size="sm"
            :variant="state === null ? 'secondary' : 'dark'"
            @click="onChange(membership, currentPage)"
          >
            All
          </b-button>
        </b-button-group>
      </div>
      <b-alert
        variant="info"
        show
        class="mb-3"
        v-if="!filteredWithdrawals.length"
      >
        <span v-if="state === WithdrawalState.Pending">
          You have no pending withdrawals.
        </span>
        <span v-if="state === WithdrawalState.Withdrawn">
          You have no withdrawn withdrawals.
        </span>
        <span v-if="state === null"> You have no withdrawals. </span>
      </b-alert>
      <div class="mb-auto">
        <base-list-group-item-withdrawal
          :erc20="erc20"
          :withdrawal="withdrawal"
          :membership="membership"
          :key="key"
          v-for="(withdrawal, key) of filteredWithdrawals"
        />
      </div>
      <b-pagination
        class="mt-3"
        v-if="total > perPage"
        @change="onChange"
        v-model="currentPage"
        :per-page="perPage"
        :total-rows="total"
        align="fill"
      ></b-pagination>
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
import {
  IWithdrawals,
  Withdrawal,
  WithdrawalState,
} from '@thxnetwork/wallet/store/modules/withdrawals';
import {
  IMemberships,
  TMembership,
} from '@thxnetwork/wallet/store/modules/memberships';
import BaseListGroupItemWithdrawal from '@thxnetwork/wallet/components/list-items/BaseListGroupItemWithdrawal.vue';
import { TERC20 } from '@thxnetwork/wallet/store/modules/erc20';

@Component({
  components: {
    BaseListGroupItemWithdrawal,
  },
  computed: {
    ...mapState('erc20', ['contracts']),
    ...mapGetters({
      withdrawals: 'withdrawals/all',
      memberships: 'memberships/all',
    }),
  },
})
export default class MembershipWithdrawalsView extends Vue {
  WithdrawalState = WithdrawalState;
  busy = true;
  error = '';
  currentPage = 1;
  perPage = 10;
  total = 0;
  state: WithdrawalState | null = WithdrawalState.Pending;

  // getters
  withdrawals!: IWithdrawals;
  memberships!: IMemberships;

  contracts!: { [id: string]: TERC20 };

  get membership() {
    return this.memberships[this.$router.currentRoute.params.id];
  }

  get erc20() {
    if (!this.membership) return null;
    return this.contracts[this.membership.erc20Id];
  }

  get filteredWithdrawals() {
    if (!this.withdrawals[this.$router.currentRoute.params.id]) return [];
    return Object.values(
      this.withdrawals[this.$router.currentRoute.params.id]
    ).filter((w: Withdrawal) => w.page === this.currentPage);
  }

  async onChange(
    membership: TMembership,
    page: number,
    state: WithdrawalState | null = null
  ) {
    const { pagination, error } = await this.$store.dispatch(
      'withdrawals/filter',
      {
        membership,
        page,
        limit: this.perPage,
        state,
      }
    );
    this.state = state;
    this.total = pagination?.total;
    this.error = error;
  }

  async mounted() {
    this.$store
      .dispatch('memberships/get', this.$route.params.id)
      .then(async () => {
        await this.$store.dispatch(
          'erc20/getContract',
          this.membership.erc20Id
        );
        this.onChange(this.membership, this.currentPage, this.state);
        this.busy = false;
      });
  }
}
</script>
