<template>
  <b-list-group-item
    v-if="token"
    :to="
      membership.erc20Id ? `/memberships/${membership._id}/withdrawals` : null
    "
    class="d-flex justify-content-between align-items-center"
  >
    <div class="mr-auto">
      <i
        v-b-tooltip
        :title="ChainId[membership.chainId]"
        class="fas mr-2 text-primary"
        :class="{
          'fa-coins': membership.erc20Id,
          'fa-palette': membership.erc721Id,
        }"
      ></i>
      <strong class="mr-1">{{ token.symbol }} Pool</strong>
      <b-badge class="px-2" v-if="pendingWithdrawalCount" variant="danger">{{
        pendingWithdrawalCount
      }}</b-badge>
      <br />
      <small v-if="membership.poolBalance" class="text-muted">
        {{ membership.poolBalance }} {{ token.symbol }}
      </small>
    </div>
    <b-dropdown
      variant="white"
      no-caret
      toggle-class="d-flex align-items-center"
    >
      <template #button-content>
        <i
          class="fas fa-ellipsis-v p-1 ml-0 text-muted"
          aria-hidden="true"
          style="font-size: 1rem"
        ></i>
      </template>
      <b-dropdown-item-button
        @click.prevent="window.open(token.blockExplorerUrl, '_blank')"
      >
        <span class="text-muted">
          <i class="fas fa-external-link-alt mr-2"></i>
          Block Explorer
        </span>
      </b-dropdown-item-button>
      <b-dropdown-item
        v-b-modal="`modalDepositPool-${membership._id}`"
        v-if="membership.erc20Id"
      >
        <span class="text-muted">
          <i class="fas fa-download mr-2"></i>
          Deposit
        </span>
      </b-dropdown-item>
      <b-dropdown-item
        :to="`/memberships/${membership._id}/withdrawals`"
        v-if="membership.erc20Id"
      >
        <span class="text-muted">
          <i class="fas fa-upload mr-2"></i>
          Withdrawals
        </span>
      </b-dropdown-item>
      <b-dropdown-item
        :to="`/memberships/${membership._id}/promotions`"
        v-if="membership.erc20Id"
      >
        <span class="text-muted">
          <i class="fas fa-tags mr-2"></i>
          Promotions
        </span>
      </b-dropdown-item>
      <b-dropdown-item
        :to="`/memberships/${membership._id}/erc20swaprules`"
        v-if="membership.erc20Id"
      >
        <span class="text-muted">
          <i class="fas fa-sync mr-2"></i>
          Swaps
        </span>
      </b-dropdown-item>
      <b-dropdown-divider v-if="membership.erc20Id" />
      <b-dropdown-item
        v-b-modal="`modalDeleteMembership-${membership._id}`"
        class="text-danger"
      >
        <span class="text-muted">
          <i class="fas fa-trash-alt mr-2"></i>
          Remove
        </span>
      </b-dropdown-item>
    </b-dropdown>
    <base-modal-deposit-pool :membership="membership" />
    <modal-delete
      :id="`modalDeleteMembership-${membership._id}`"
      :call="remove"
      :subject="membership._id"
    />
  </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import {
  IMemberships,
  TMembership,
} from '@thxnetwork/wallet/store/modules/memberships';
import { WithdrawalState } from '@thxnetwork/wallet/store/modules/withdrawals';
import BaseModalDepositPool from '../modals/ModalDepositPool.vue';
import ModalDelete from '../modals/ModalDelete.vue';
import { TERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import { ERC721 } from '@thxnetwork/wallet/store/modules/erc721';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';

@Component({
  components: {
    BaseModalDepositPool,
    ModalDelete,
  },
  computed: {
    ...mapState({
      erc20s: (state: any) => state.erc20.contracts,
      erc721s: (state: any) => state.erc721.erc721s,
    }),
    ...mapGetters({
      profile: 'account/profile',
      memberships: 'memberships/all',
    }),
  },
})
export default class BaseListGroupItemMembership extends Vue {
  window = window;
  ChainId = ChainId;
  busy = true;
  pendingWithdrawalCount = 0;

  profile!: UserProfile;
  memberships!: IMemberships;
  erc20s!: { [id: string]: TERC20 };
  erc721s!: { [id: string]: ERC721 };

  @Prop() membership!: TMembership;

  get token() {
    return this.membership.erc20Id
      ? this.erc20s[this.membership.erc20Id]
      : this.erc721s[this.membership.erc721Id];
  }

  remove() {
    this.$store.dispatch('memberships/delete', this.membership._id);
  }

  async mounted() {
    if (this.membership.erc20Id) {
      this.$store.dispatch('erc20/getContract', this.membership.erc20Id);
      this.$store
        .dispatch('withdrawals/filter', {
          profile: this.profile,
          membership: this.membership,
          state: WithdrawalState.Pending,
        })
        .then(({ pagination }) => {
          this.pendingWithdrawalCount = pagination?.total;
        });
    }
    if (this.membership.erc721Id) {
      this.$store.dispatch('erc721/get', this.membership.erc721Id);
    }
  }
}
</script>
