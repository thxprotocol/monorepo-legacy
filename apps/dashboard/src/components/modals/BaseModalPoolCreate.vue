<template>
    <base-modal :loading="loading" :error="error" title="Create Campaign" :id="id">
        <template #modal-body v-if="!loading">
            <b-form-group label="Title">
                <b-form-input v-model="title" placeholder="My Quest Campaign" class="mr-3" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="loading" class="rounded-pill" @click="submit()" variant="primary" block>
                Create Campaign
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormSelectNetwork from '@thxnetwork/dashboard/components/form-select/BaseFormSelectNetwork.vue';
import BaseModal from './BaseModal.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import BaseCampaignDuration from '@thxnetwork/dashboard/components/form-group/BaseDateDuration.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';

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
    poolVariant = 'defaultPool';
    profile!: TAccount;
    chainInfo = chainInfo;
    title = '';
    startDate: Date | null = null;
    endDate: Date | null = null;

    @Prop() id!: string;

    async submit() {
        this.loading = true;

        await this.$store.dispatch('pools/create', {
            title: this.title,
        });

        this.$bvModal.hide(this.id);
        this.loading = false;
        this.$emit('created');
    }
}
</script>
