<template>
    <BaseModalQuestCreate
        variant="Social Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-title="title = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-info-links="infoLinks = Object.values($event)"
        @change-published="isPublished = $event"
        @change-date="expiryDate = $event"
        @change-locks="locks = $event"
        :published="isPublished"
        :info-links="infoLinks"
        :id="id"
        :error="error"
        :loading="isLoading"
        :disabled="isSubmitDisabled || !amount || !title"
        :quest="reward"
        :pool="pool"
    >
        <template #col-left>
            <b-form-group label="Amount">
                <b-form-input type="number" v-model="amount" />
            </b-form-group>
        </template>
        <template #col-right>
            <BaseCardQuestRequirement
                class="mb-3"
                :pool="pool"
                :requirement="requirement"
                @change="requirement = $event"
            />
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AccessTokenKind, QuestVariant, QuestSocialRequirement } from '@thxnetwork/common/enums';
import { providerInteractionList, providerList } from '@thxnetwork/dashboard/types/rewards';
import { mapGetters } from 'vuex';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModal from './BaseModal.vue';
import BaseModalQuestCreate from './BaseModalQuestCreate.vue';
import BaseCardQuestRequirement from '../cards/BaseCardQuestRequirement.vue';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';
import { questInteractionVariantMap } from '@thxnetwork/common/maps';

const requirementDefaultsMap = {
    [QuestVariant.Twitter]: {
        kind: AccessTokenKind.Twitter,
        interaction: QuestSocialRequirement.TwitterFollow,
    },
    [QuestVariant.Discord]: {
        kind: AccessTokenKind.Discord,
        interaction: QuestSocialRequirement.DiscordGuildJoined,
    },
    [QuestVariant.YouTube]: {
        kind: AccessTokenKind.Google,
        interaction: QuestSocialRequirement.YouTubeSubscribe,
    },
};

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
        BaseCardQuestRequirement,
        BaseCardInfoLinks,
    },
    computed: mapGetters({
        totals: 'pointRewards/totals',
        profile: 'account/profile',
    }),
})
export default class ModalQuestSocialCreate extends Vue {
    isLoading = false;
    error = '';
    title = '';
    amount = 0;
    description = '';
    limit = 0;
    isPublished = false;
    requirement: {
        kind: AccessTokenKind;
        interaction: QuestSocialRequirement;
        content: string;
        contentMetadata: object;
    } = {
        kind: providerList[0].kind,
        interaction: providerInteractionList[0].type,
        content: '',
        contentMetadata: {},
    };
    profile!: TAccount;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    file: File | null = null;
    expiryDate: Date | number | null = null;
    locks: TQuestLock[] = [];

    @Prop() id!: string;
    @Prop() variant!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestSocial;

    get isSubmitDisabled() {
        return this.requirement && (!this.requirement.content || !this.requirement.contentMetadata);
    }

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.requirement = this.reward
            ? {
                  kind: this.reward.kind,
                  interaction: this.reward.interaction,
                  content: this.reward.content,
                  contentMetadata: JSON.parse(this.reward.contentMetadata),
              }
            : {
                  ...requirementDefaultsMap[QuestVariant[this.variant]],
                  content: '',
                  contentMetadata: {},
              };
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.locks = this.reward ? this.reward.locks : this.locks;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                variant: questInteractionVariantMap[this.requirement.interaction],
                _id: this.reward ? this.reward._id : undefined,
                poolId: this.pool._id,
                title: this.title,
                file: this.file,
                description: this.description,
                amount: this.amount,
                isPublished: this.isPublished,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                kind: this.requirement.kind,
                interaction: this.requirement.interaction,
                content: this.requirement.content,
                contentMetadata: JSON.stringify(this.requirement.contentMetadata),
                expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
                page: this.reward ? this.reward.page : 1,
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
