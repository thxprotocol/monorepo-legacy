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
        @change-gates="gateIds = $event"
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
                <b-form-input v-model="amount" />
            </b-form-group>
        </template>
        <template #col-right>
            <BaseCardRewardCondition
                class="mb-3"
                :rewardCondition="rewardCondition"
                @change="rewardCondition = $event"
            />
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { TInfoLink, type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TPointReward, TAccount } from '@thxnetwork/types/interfaces';
import { QuestVariant, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { platformInteractionList, platformList } from '@thxnetwork/dashboard/types/rewards';
import { mapGetters } from 'vuex';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModal from './BaseModal.vue';
import BaseModalQuestCreate from './BaseModalQuestCreate.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
        BaseCardRewardCondition,
        BaseCardInfoLinks,
    },
    computed: mapGetters({
        totals: 'pointRewards/totals',
        profile: 'account/profile',
    }),
})
export default class ModalRewardPointsCreate extends Vue {
    isLoading = false;
    error = '';
    title = '';
    amount = 0;
    description = '';
    limit = 0;
    isPublished = false;
    rewardCondition: {
        platform: RewardConditionPlatform;
        interaction: RewardConditionInteraction;
        content: string;
        contentMetadata?: object;
    } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    profile!: TAccount;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    file: File | null = null;
    expiryDate: Date | number | null = null;

    @Prop() id!: string;
    @Prop() variant!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TPointReward;

    get isSubmitDisabled() {
        return (
            this.rewardCondition.interaction &&
            this.rewardCondition.interaction !== RewardConditionInteraction.None &&
            (!this.rewardCondition.content || !this.rewardCondition.contentMetadata)
        );
    }

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.rewardCondition = this.reward
            ? {
                  platform: this.reward.platform,
                  interaction: this.reward.interaction,
                  content: this.reward.content,
                  contentMetadata: this.reward.contentMetadata,
              }
            : {
                  ...this.getConditionDefaults(this.variant),
                  content: '',
                  contentMetadata: {},
              };
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
    }

    getConditionDefaults(questVariant: string) {
        const variant = QuestVariant[questVariant];
        switch (variant) {
            case QuestVariant.Twitter:
                return {
                    platform: RewardConditionPlatform.Twitter,
                    interaction: RewardConditionInteraction.TwitterFollow,
                };
            case QuestVariant.Discord:
                return {
                    platform: RewardConditionPlatform.Discord,
                    interaction: RewardConditionInteraction.DiscordGuildJoined,
                };
            case QuestVariant.YouTube:
                return {
                    platform: RewardConditionPlatform.Google,
                    interaction: RewardConditionInteraction.YouTubeSubscribe,
                };
            default:
                return {
                    platform: RewardConditionPlatform.None,
                    interaction: RewardConditionInteraction.None,
                };
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pointRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                _id: this.reward ? this.reward._id : undefined,
                poolId: this.pool._id,
                title: this.title,
                file: this.file,
                description: this.description,
                amount: this.amount,
                isPublished: this.isPublished,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                platform: this.rewardCondition.platform,
                interaction:
                    this.rewardCondition.platform !== RewardConditionPlatform.None
                        ? this.rewardCondition.interaction
                        : RewardConditionInteraction.None,
                content:
                    this.rewardCondition.platform !== RewardConditionPlatform.None ? this.rewardCondition.content : '',
                contentMetadata:
                    this.rewardCondition.contentMetadata &&
                    this.rewardCondition.platform !== RewardConditionPlatform.None
                        ? this.rewardCondition.contentMetadata
                        : '',
                expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
                page: this.reward ? this.reward.page : 1,
                index: !this.reward ? this.total : this.reward.index,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit');
                this.isLoading = false;
            });
    }
}
</script>
