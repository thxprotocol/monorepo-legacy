<template>
    <BaseModalQuestCreate
        variant="Invite Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-title="title = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-info-links="infoLinks = Object.values($event)"
        @change-published="isPublished = $event"
        @change-date="expiryDate = $event"
        @change-locks="locks = $event"
        :info-links="infoLinks"
        :id="id"
        :error="error"
        :loading="isLoading"
        :published="isPublished"
        :disabled="isSubmitDisabled || !amount || !title"
        :quest="reward"
        :pool="pool"
    >
        <template #col-left>
            <b-form-group label="Amount">
                <b-form-input v-model="amount" />
            </b-form-group>
            <b-form-group
                label="Invite URL"
                description="This URL will be appended with a code that identifies the user that refers a friend."
                v-if="pool.widget"
            >
                <b-input-group :prepend="`${pool.widget.domain}/`">
                    <b-form-input v-model="pathname" />
                </b-input-group>
            </b-form-group>
            <b-form-group label="Qualification">
                <b-form-checkbox v-model="isMandatoryReview"> Enable mandatory manual review </b-form-checkbox>
            </b-form-group>
        </template>

        <template #col-right>
            <BaseCardURLQualify :visible="isVisibleCardURLQualify" :url="successUrl" @input="successUrl = $event" />
            <BaseCardURLWebhook
                class="mb-3"
                :visible="isVisibleCardWebhookQualify"
                :code="code"
                title="Webhook Qualification"
                description="You can also choose to run this webhook to qualify the referral and trigger a point transfer."
            >
                <template #alerts>
                    <b-alert show variant="info">
                        <i class="fas fa-question-circle mr-2"></i> Take note of these development guidelines:
                        <ul class="px-3 mb-0 mt-1 small">
                            <li v-if="!reward">
                                <strong>REFERRAL_TOKEN</strong> will be populated after creating this referral reward.
                            </li>
                            <li>
                                <strong>REFERRAL_CODE</strong> should be derived from the
                                <code>$_GET['ref']</code>
                                value in the referral URL used on your site.
                            </li>
                        </ul>
                    </b-alert>
                </template>
            </BaseCardURLWebhook>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import Shell from 'highlight.js/lib/languages/shell';
import { QuestVariant } from '@thxnetwork/common/enums';
import { mapGetters } from 'vuex';
import { UserProfile } from 'oidc-client-ts';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardURLQualify from '@thxnetwork/dashboard/components/cards/BaseCardURLQualify.vue';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

hljs.registerLanguage('shell', Shell);

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardURLQualify,
        BaseCardURLWebhook,
        BaseModalQuestCreate,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class ModalQuestInviteCreate extends Vue {
    isSubmitDisabled = false;
    isMandatoryReview = false;
    isLoading = false;
    isVisibleCardURLQualify = true;
    isVisibleCardWebhookQualify = false;
    isCopied = false;
    error = '';
    title = '';
    amount = '0';
    isPublished = false;
    successUrl = '';
    description = '';
    pathname = '';
    claimAmount = 1;
    profile!: UserProfile;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    file: File | null = null;
    expiryDate: Date | string = '';
    locks: TQuestLock[] = [];

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestInvite;

    get code() {
        return `curl "${API_URL}/v1/webhook/referral/${this.reward ? this.reward.token : '<REFERRAL_TOKEN>'}/qualify" \\
-X POST \\
-d "code=<REFERRAL_CODE>"`;
    }

    get codeExample() {
        return hljs.highlight(this.code, { language: 'shell' }).value;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? String(this.reward.amount) : '0';
        this.pathname = this.reward ? this.reward.pathname : '';
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.successUrl = this.reward ? this.reward.successUrl : '';
        this.isVisibleCardURLQualify = this.reward ? !!this.reward.successUrl : true;
        this.isVisibleCardWebhookQualify = this.reward ? !this.reward.successUrl : false;
        this.isMandatoryReview = this.reward ? this.reward.isMandatoryReview : this.isMandatoryReview;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.locks = this.reward ? this.reward.locks : this.locks;
    }

    onChangeLink({ key, label, url }: TInfoLink & { key: number }) {
        let update = {};

        if (label || label === '') update = { ...this.infoLinks[key], label };
        if (url || url === '') update = { ...this.infoLinks[key], url };
        if (typeof label === 'undefined' && typeof url === 'undefined') {
            Vue.delete(this.infoLinks, key);
        } else {
            Vue.set(this.infoLinks, key, update);
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                variant: QuestVariant.Invite,
                page: 1,
                poolId: String(this.pool._id),
                title: this.title,
                description: this.description,
                pathname: this.pathname,
                amount: this.amount,
                isPublished: this.isPublished,
                expiryDate: this.expiryDate,
                claimAmount: this.claimAmount,
                successUrl: this.successUrl,
                isMandatoryReview: this.isMandatoryReview,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                index: !this.reward ? this.total : this.reward.index,
                locks: this.locks,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit', { isPublished: this.isPublished });
                this.isLoading = false;
            });
    }
}
</script>
