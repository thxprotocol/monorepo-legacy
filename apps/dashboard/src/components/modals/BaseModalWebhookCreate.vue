<template>
    <base-modal @show="onShow" size="lg" :title="(webhook ? 'Update' : 'Create') + ' Webhook'" :id="id" :error="error">
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit" id="formWebhookCreate">
                <BaseFormGroup
                    required
                    label="URL"
                    tooltip="Provide a public endpoint of your system that is protected with your signing secret."
                    :state="isValidWebhook"
                >
                    <b-form-input v-model="url" :state="isValidWebhook" />
                    <template #description>
                        Learn how you can
                        <b-link href="https://docs.thx.network/developers/webhooks" target="_blank">
                            protect your public endpoint
                        </b-link>
                        using your signing secret.
                    </template>
                </BaseFormGroup>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isDisabled"
                class="rounded-pill"
                type="submit"
                form="formWebhookCreate"
                variant="primary"
                block
            >
                {{ (webhook ? 'Update' : 'Create') + ' Webhook' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardURLWebhook from '../cards/BaseCardURLWebhook.vue';
import BaseCardInfoLinks from '@thxnetwork/dashboard/components/cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardURLWebhook,
        BaseCardInfoLinks,
    },
})
export default class ModalWebhookCreate extends Vue {
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

    get isDisabled() {
        return !this.isValidWebhook || this.isLoading;
    }

    onShow() {
        this.url = this.webhook ? this.webhook.url : '';
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`webhooks/${this.webhook ? 'update' : 'create'}`, {
                ...this.webhook,
                poolId: this.pool._id,
                url: this.url,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
