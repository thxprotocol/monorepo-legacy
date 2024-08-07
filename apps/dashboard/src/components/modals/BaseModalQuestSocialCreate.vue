<template>
    <BaseModalQuestCreate
        label="Social Quest"
        @show="onShow"
        @submit="onSubmit"
        :id="id"
        :pool="pool"
        :quest="quest"
        :loading="isLoading"
        :disabled="isSubmitDisabled"
        :error="error"
    >
        <template #col-left>
            <BaseFormGroup
                required
                label="Amount"
                tooltip="The amount of points the campaign participant will earn for completing this quest."
            >
                <b-form-input type="number" v-model="amount" />
            </BaseFormGroup>
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
import { questInteractionVariantMap } from '@thxnetwork/common/maps';
import BaseModalQuestCreate from './BaseModalQuestCreate.vue';
import BaseCardQuestRequirement from '../cards/BaseCardQuestRequirement.vue';
import BaseCardInfoLinks from '../cards/BaseCardInfoLinks.vue';
import BaseFormGroup from '../form-group/BaseFormGroup.vue';

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
        BaseModalQuestCreate,
        BaseCardQuestRequirement,
        BaseCardInfoLinks,
        BaseFormGroup,
    },
})
export default class ModalQuestSocialCreate extends Vue {
    isLoading = false;
    error = '';
    amount = 0;
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

    @Prop() id!: string;
    @Prop() variant!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuestSocial;

    get isSubmitDisabled() {
        return this.requirement && (!this.requirement.content || !this.requirement.contentMetadata);
    }

    onShow() {
        this.amount = this.quest ? this.quest.amount : this.amount;
        this.requirement = this.quest
            ? {
                  kind: this.quest.kind,
                  interaction: this.quest.interaction,
                  content: this.quest.content,
                  contentMetadata: JSON.parse(this.quest.contentMetadata),
              }
            : {
                  ...requirementDefaultsMap[QuestVariant[this.variant]],
                  content: '',
                  contentMetadata: {},
              };
    }

    async onSubmit(payload: TBaseQuest) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.quest ? 'updateQuest' : 'createQuest'}`, {
                ...this.quest,
                ...payload,
                variant: questInteractionVariantMap[this.requirement.interaction],
                amount: this.amount,
                kind: this.requirement.kind,
                interaction: this.requirement.interaction,
                content: this.requirement.content,
                contentMetadata: JSON.stringify(this.requirement.contentMetadata),
            });
            this.$bvModal.hide(this.id);
            this.$emit('submit', { isPublished: payload.isPublished });
        } catch (error: any) {
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
