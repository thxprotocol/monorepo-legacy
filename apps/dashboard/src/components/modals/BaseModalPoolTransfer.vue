<template>
    <b-modal
        size="lg"
        title="Campaign ownership transfer"
        :id="`modalPoolTransfer${pool._id}`"
        no-close-on-backdrop
        no-close-on-esc
        centered
        :hide-footer="loading"
        @show="onShow"
    >
        <p class="text-muted">
            Configure a loyalty pool for someone else and transfer pool ownership afterwards by sharing this URL with
            someone else.
        </p>
        <b-form-group :key="key" v-for="(transfer, key) of pool.transfers">
            <b-input-group>
                <b-form-input size="sm" readonly :value="transfer.url" />
                <b-input-group-append>
                    <b-button
                        variant="primary"
                        v-clipboard:copy="transfer.url"
                        v-clipboard:success="() => (transfer.isCopied = true)"
                        style="white-space: normal"
                        size="sm"
                    >
                        <i class="fas ml-0" :class="transfer.isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                    </b-button>
                </b-input-group-append>
                <b-input-group-append>
                    <b-dropdown
                        size="sm"
                        variant="primary"
                        right
                        no-caret
                        toggle-class="d-flex align-items-center float-right"
                    >
                        <template #button-content>
                            <i class="fas fa-ellipsis-v m-0" aria-hidden="true"></i>
                        </template>
                        <b-dropdown-item @click="onClickTransferRefresh" link-class="text-muted small">
                            Refresh expiry
                        </b-dropdown-item>
                        <b-dropdown-item @click="onClickTransferRecreate" link-class="text-muted small">
                            Recreate URL
                        </b-dropdown-item>
                    </b-dropdown>
                </b-input-group-append>
            </b-input-group>
            <div class="small">
                <span :class="transfer.isExpired ? 'text-danger' : 'text-muted'">
                    {{ transfer.isExpired ? 'Expired' : 'Expires' }} at
                    {{ format(new Date(transfer.expiry), 'dd-MM-yyyy HH:mm') }}
                </span>
            </div>
        </b-form-group>
        <b-alert variant="warning" show class="mb-0">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Ask to sign out and sign in through this URL for the pool to be transfered.
        </b-alert>
        <template #modal-footer="{ hide }">
            <b-button :disabled="loading" class="rounded-pill" variant="primary" @click="hide" block> Close </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { TPool, TPoolTransferResponse } from '@thxnetwork/types/index';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import { mapGetters } from 'vuex';
import type { TAccount } from '@thxnetwork/types/interfaces';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseModalPoolTransfer extends Vue {
    format = format;
    loading = false;
    dashboardUrl = BASE_URL;
    profile!: TAccount;

    @Prop() pool!: TPool & { transfers: TPoolTransferResponse[] };

    onShow() {
        this.$store.dispatch('pools/listTransfers', this.pool);
    }

    onClickTransferRefresh() {
        this.$store.dispatch('pools/refreshTransfers', this.pool);
    }

    onClickTransferRecreate() {
        this.$store.dispatch('pools/deleteTransfers', this.pool);
    }
}
</script>
