<template>
  <b-card header-bg-variant="primary" header-class="text-white small text-center p-0" body-class="p-2" class="my-1">
    <template #header>
      {{ TransactionType[tx.type] }}
    </template>
    <div class="d-flex justify-content-between w-100 align-items-center">
      <base-badge-network :chainId="tx.chainId" class="mr-2" />
      <b-link v-if="tx.transactionHash" :href="`${chainInfo[tx.chainId].blockExplorer}/tx/${
        tx.transactionHash
      }`">
        <i class="fas fa-external-link-alt mx-1"></i>
      </b-link>
    </div>
    <hr class="my-3" />
    <b-row>
      <b-col>
        <div class="text-muted">Status:</div>
      </b-col>
      <b-col>
        <strong :class="`text-${state.variant}`">{{ state.label }}</strong>
        <i v-b-tooltip :title="tx.failReason" v-if="tx.failReason && tx.state === TransactionState.Failed"
          class="fas fa-exclamation-circle ml-1 text-danger"></i>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div class="text-muted">To:</div>
      </b-col>
      <b-col>
        <base-anchor-address variant="light" :address="tx.to" :chain-id="tx.chainId" />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div class="text-muted">Scheduled:</div>
      </b-col>
      <b-col>
        <small>{{ format(new Date(tx.createdAt), 'MMMM dd HH:mm:ss ') }}</small>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div class="text-muted">Updated:</div>
      </b-col>
      <b-col>
        <small>{{ format(new Date(tx.updatedAt), 'MMMM dd HH:mm:ss') }}</small>
      </b-col>
    </b-row>
  </b-card>
</template>

<script lang="ts">
import type {
  TransactionState,
  TransactionType,
  TTransaction,
} from '../../types/Transactions';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';
import BaseBadgeNetwork from '../badges/BaseBadgeNetwork.vue';
import BaseAnchorAddress from '../BaseAnchorAddress.vue';

@Component({
  components: {
    BaseBadgeNetwork,
    BaseAnchorAddress,
  },
})
export default class BaseCardTransaction extends Vue {
  TransactionType = TransactionType;
  TransactionState = TransactionState;
  chainInfo = chainInfo;
  format = format;

  @Prop() tx!: TTransaction;

  get state() {
    switch (this.tx.state) {
      default:
      case TransactionState.Scheduled:
        return { variant: 'info', label: 'Scheduled' };
      case TransactionState.Sent:
        return { variant: 'info', label: 'Sent' };
      case TransactionState.Failed:
        return { variant: 'danger', label: 'Failed' };
      case TransactionState.Mined:
        return { variant: 'success', label: 'Mined' };
    }
  }
}
</script>
