<template>
    <base-modal
        @show="onShow"
        size="md"
        :title="(webhook ? 'Update' : 'Create') + ' Webhook'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit" id="formWebhookCreate">
                <b-form-group label="URL" :state="isValidWebhook">
                    <b-form-input v-model="url" :state="isValidWebhook" />
                </b-form-group>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formWebhookCreate"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' Webhook' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardURLWebhook from '../BaseCardURLWebhook.vue';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';
import { TWebhook } from '@thxnetwork/types/interfaces';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardURLWebhook,
        BaseCardInfoLinks,
    },
})
export default class ModalMilestoneRewardCreate extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    error = '';
    url = '';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) webhook!: TWebhook;

    get isValidWebhook() {
        if (!this.url) return;
        return isValidUrl(this.url);
    }

    onShow() {
        this.url = this.webhook ? this.webhook.url : '';
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`webhooks/${this.webhook ? 'update' : 'create'}`, {
                ...this.webhook,
                url: this.url,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
