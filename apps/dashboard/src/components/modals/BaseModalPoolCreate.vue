<template>
    <base-modal :error="error" title="Create Campaign" :id="id">
        <template #modal-body>
            <BaseFormGroup
                required
                label="Campaign Title"
                tooltip="The name of your campaign used to identity your campaign amongst others."
            >
                <b-form-input v-model="title" placeholder="My Quest Campaign" class="mr-3" />
            </BaseFormGroup>
        </template>
        <template #btn-primary>
            <b-button :disabled="isDisabled" class="rounded-pill" @click="submit()" variant="primary" block>
                <b-spinner v-if="isLoading" small />
                <span v-else> Create Campaign </span>
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import BaseCampaignDuration from '@thxnetwork/dashboard/components/form-group/BaseDateDuration.vue';
import BaseFormGroup from '@thxnetwork/dashboard/components/form-group/BaseFormGroup.vue';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';

@Component({
    components: {
        chainInfo,
        BaseModal,
        BaseIdenticon,
        BaseCampaignDuration,
        BaseFormGroup,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class ModalAssetPoolCreate extends Vue {
    isLoading = false;
    error = '';
    poolVariant = 'defaultPool';
    profile!: TAccount;
    chainInfo = chainInfo;
    title = '';
    startDate: Date | null = null;
    endDate: Date | null = null;

    @Prop() id!: string;

    get isDisabled() {
        return this.isLoading || !this.title;
    }

    async submit() {
        this.isLoading = true;

        const data = await this.$store.dispatch('pools/create', {
            title: this.title,
        });

        this.$bvModal.hide(this.id);
        this.$router.push({ name: 'pool', params: { id: data._id } });
        this.isLoading = false;
    }
}
</script>
