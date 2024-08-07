<template>
    <BaseModalQuestCreate
        label="Gitcoin Quest"
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
                tooltip="The amount of points a participant earns when completing this quest"
            >
                <b-form-input min="0" type="number" v-model="amount" />
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Scorer"
                description="Choose a Gitcoin Scorer."
                tooltip="The GitCoin strategy used to determine the humanity score of a campaign participant."
            >
                <b-form-select v-model="scorerId" :options="scorerOptions" />
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Score"
                description="Determine a scoring threshold between 0 and 100."
                tooltip="The minimum GitCoin score required for the verified wallet of a campaign participant in order to complete the quest."
            >
                <b-form-input min="0" max="100" type="number" v-model="score" />
            </BaseFormGroup>
        </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestVariant } from '@thxnetwork/common/enums';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

enum GitcoinScorerVariant {
    UniqueHumanity = 6298,
    UniqueHumanityBinary = 6317,
}

@Component({
    components: {
        BaseModalQuestCreate,
    },
})
export default class ModalQuestWeb3Create extends Vue {
    isLoading = false;
    isVisible = true;
    error = '';
    amount = 0;
    scorerId = GitcoinScorerVariant.UniqueHumanity;
    score = 0;
    scorerOptions = [
        { text: 'Unique Humanity', value: GitcoinScorerVariant.UniqueHumanity },
        { text: 'Unique Humanity (Binary)', value: GitcoinScorerVariant.UniqueHumanityBinary, disabled: true },
    ];

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuestGitcoin;

    get isSubmitDisabled() {
        return false;
    }

    onShow() {
        this.amount = this.quest ? this.quest.amount : this.amount;
        this.scorerId = this.quest ? this.quest.scorerId : this.scorerId;
        this.score = this.quest ? this.quest.score : this.score;
    }

    async onSubmit(payload: TBaseQuest) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.quest ? 'updateQuest' : 'createQuest'}`, {
                ...this.quest,
                ...payload,
                variant: QuestVariant.Gitcoin,
                amount: this.amount,
                scorerId: this.scorerId,
                score: this.score,
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
