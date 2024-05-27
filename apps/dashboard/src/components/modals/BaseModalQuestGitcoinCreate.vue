<template>
    <BaseModalQuestCreate
        variant="Gitcoin Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-info-links="infoLinks = Object.values($event)"
        @change-title="title = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-published="isPublished = $event"
        @change-date="expiryDate = $event"
        @change-locks="locks = $event"
        :published="isPublished"
        :id="id"
        :error="error"
        :info-links="infoLinks"
        :loading="isLoading"
        :disabled="isSubmitDisabled"
        :quest="reward"
        :pool="pool"
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
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { QuestVariant } from '@thxnetwork/common/enums';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

enum GitcoinScorerVariant {
    UniqueHumanity = 6298,
    UniqueHumanityBinary = 6317,
}

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
    },
})
export default class ModalQuestWeb3Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    isVisible = true;
    isPublished = false;
    error = '';
    title = '';
    image = '';
    file: File | null = null;
    description = '';
    amount = 0;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    expiryDate: Date | number | null = null;
    locks: TQuestLock[] = [];
    scorerId = GitcoinScorerVariant.UniqueHumanity;
    score = 0;

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestGitcoin;

    scorerOptions = [
        { text: 'Unique Humanity', value: GitcoinScorerVariant.UniqueHumanity },
        { text: 'Unique Humanity (Binary)', value: GitcoinScorerVariant.UniqueHumanityBinary, disabled: true },
    ];

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : this.description;
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.locks = this.reward ? this.reward.locks : this.locks;
        this.scorerId = this.reward ? this.reward.scorerId : this.scorerId;
        this.score = this.reward ? this.reward.score : this.score;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                variant: QuestVariant.Gitcoin,
                page: 1,
                index: this.reward ? this.reward.index : this.total,
                isPublished: this.isPublished,
                poolId: String(this.pool._id),
                file: this.file,
                title: this.title,
                description: this.description,
                amount: this.amount,
                expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                locks: JSON.stringify(this.locks),
                scorerId: this.scorerId,
                score: this.score,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit', { isPublished: this.isPublished });
                this.isLoading = false;
            });
    }
}
</script>
