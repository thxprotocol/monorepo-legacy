<template>
  <b-popover :target="target" triggers="hover" placement="left">
    <!-- <template #title>Transactions</template> -->
    <base-card-transaction
      style="width: 240px"
      :tx="tx"
      :key="key"
      v-for="(tx, key) of transactions"
    />
  </b-popover>
</template>

<script lang="ts">
import { TTransaction } from '@thxnetwork/wallet/types/Transactions';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseCardTransaction from '../cards/BaseCardTransaction.vue';

@Component({
  components: {
    BaseCardTransaction,
  },
  computed: mapGetters({
    transactionList: 'transactions/all',
  }),
})
export default class BasePopoverTransactions extends Vue {
  isLoading = true;

  @Prop() target!: string;
  @Prop() transactions!: TTransaction[];
}
</script>
