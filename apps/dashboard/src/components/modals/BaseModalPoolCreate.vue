<template>
    <base-modal :loading="loading" :error="error" title="Create Campaign" :id="id">
        <template #modal-body v-if="!loading">
            <b-form-group label="Title">
                <b-form-input v-model="title" placeholder="My Reward Campaign" class="mr-3" />
            </b-form-group>
            <base-form-select-network v-if="!loading" :chainId="chainId" @selected="onSelectChain" />
            <BaseCampaignDuration :settings="{}" @update="onUpdateDuration" />
        </template>
        <template #btn-primary>
            <b-button :disabled="loading" class="rounded-pill" @click="submit()" variant="primary" block>
                Create Campaign
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormSelectNetwork from '@thxnetwork/dashboard/components/form-select/BaseFormSelectNetwork.vue';
import BaseModal from './BaseModal.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import BaseCampaignDuration, { parseDateTime } from '@thxnetwork/dashboard/components/form-group/BaseDateDuration.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import type { TAccount } from '@thxnetwork/common/lib/types';

@Component({
    components: {
        chainInfo,
        BaseModal,
        BaseFormSelectNetwork,
        BaseIdenticon,
        BaseCampaignDuration,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    loading = false;
    error = '';
    chainId: ChainId = ChainId.Polygon;
    poolVariant = 'defaultPool';
    profile!: TAccount;
    chainInfo = chainInfo;
    title = '';
    startDate: Date | null = null;
    endDate: Date | null = null;

    @Prop() id!: string;

    onSelectChain(chainId: ChainId) {
        this.chainId = chainId;
    }

    onUpdateDuration({ startDate, startTime, endDate, endTime }) {
        this.startDate = parseDateTime(startDate, startTime);
        this.endDate = parseDateTime(endDate, endTime);
    }

    async submit() {
        this.loading = true;

        await this.$store.dispatch('pools/create', {
            chainId: this.chainId,
            title: this.title,
            startDate: this.startDate,
            endDate: this.endDate,
        });

        this.$bvModal.hide(this.id);
        this.loading = false;
        this.$emit('created');
    }
}
</script>
