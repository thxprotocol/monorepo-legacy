<template>
    <base-modal @show="onShow" size="xl" title="Create Survey Reward" :id="id" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit" id="formRewardSurveyCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Amount">
                            <b-form-input type="number" v-model="amount" />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        Questions
                        <b-form-group class="mb-0">
                            <hr />
                            <button
                                type="button"
                                class="btn btn-primary rounded-pill m-auto"
                                v-on:click="addQuestion()"
                            >
                                Add Question
                            </button>
                        </b-form-group>
                        <div class="mt-3">
                            <BaseFormGroupSurveyRewardQuestion
                                :reward="reward"
                                v-for="n in numQuestions"
                                :key="n"
                                :order="n"
                            />
                        </div>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardSurveyCreate"
                variant="primary"
                block
            >
                {{ reward ? 'Update Survey Reward' : 'Create Survey Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { TSurveyRewardQuestion, type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TSurveyReward } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseFormGroupSurveyRewardQuestion from '../form-group/BaseFormGroupSurveyRewardQuestion.vue';

@Component({
    components: {
        BaseModal,
        BaseFormGroupSurveyRewardQuestion,
    },
})
export default class ModalSurveyRewardCreate extends Vue {
    isLoading = false;
    isVisible = true;
    error = '';
    title = '';
    description = '';
    amount = 0;
    isCopied = false;
    questions: TSurveyRewardQuestion[] = [];
    numQuestions = 0;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TSurveyReward;

    get isSubmitDisabled() {
        const isFormValid = this.title.length > 0 && this.amount > 0 && this.questions.length > 0;
        return !isFormValid;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.questions = this.reward ? this.reward.questions : [];
    }

    addQuestion() {
        this.numQuestions++;
    }

    removeQuestion() {
        this.numQuestions--;
    }

    onSubmit() {
        if (this.isSubmitDisabled) {
            return;
        }
        this.isLoading = true;
        this.$store
            .dispatch(`surveyRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                page: 1,
                poolId: String(this.pool._id),
                title: this.title,
                description: this.description,
                amount: this.amount,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
