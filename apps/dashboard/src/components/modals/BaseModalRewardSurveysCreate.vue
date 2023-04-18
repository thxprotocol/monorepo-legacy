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
                        <b-form-group label="Amount"> <b-form-input type="number" v-model="amount" /> </b-form-group
                    ></b-col>
                    <b-col>
                        <b-form-group class="mb-0">
                            <div class="d-flex justify-content-between">
                                Questions ({{ questions.length }})

                                <button
                                    type="button"
                                    class="btn btn-primary rounded-pill btn-sm"
                                    v-on:click="addQuestion()"
                                >
                                    + question
                                </button>
                            </div>
                        </b-form-group>
                        <hr />
                        <BaseFormGroupSurveyRewardQuestion
                            v-for="q in questions"
                            :key="q.order"
                            :question="q"
                            @questionAdded="onQuestionAdded"
                            @questionChanged="onQuestionChanged"
                            @questionRemoved="onQuestionRemoved"
                        />
                    </b-col>
                </b-row>
                <b-row>
                    <b-col md="6">
                        <BaseCardSurveyRewardPreview :questions="questions" />
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="!isFormValid"
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
import { TSurveyRewardQuestion, TSurveyRewardAnswer, type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TSurveyReward } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseFormGroupSurveyRewardQuestion from '../form-group/BaseFormGroupSurveyRewardQuestion.vue';
import BaseCardSurveyRewardPreview from '../cards/BaseCardSurveyRewardPreview.vue';

@Component({
    components: {
        BaseModal,
        BaseFormGroupSurveyRewardQuestion,
        BaseCardSurveyRewardPreview,
    },
})
export default class ModalSurveyRewardCreate extends Vue {
    isLoading = false;
    isVisible = true;
    error = '';

    currentSurvey: TSurveyReward = {} as TSurveyReward;
    questions: TSurveyRewardQuestion[] = [];
    title = '';
    description = '';
    amount = 0;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TSurveyReward;

    get isFormValid() {
        return (
            this.title != undefined &&
            this.title.length > 0 &&
            this.amount > 0 &&
            this.questions.length > 0 &&
            this.questions[0].answers.length > 0 &&
            this.questions[0].answers[0].value.length > 0
        );
    }

    onShow() {
        this.currentSurvey = this.reward ? this.reward : ({} as TSurveyReward);
        if (!this.currentSurvey.questions) {
            this.currentSurvey.questions = [];
        }
        this.title = this.currentSurvey.title;
        this.description = this.currentSurvey.description;
        this.amount = this.currentSurvey.amount;
        this.questions = this.currentSurvey.questions;
    }

    onQuestionAdded(question: TSurveyRewardQuestion) {
        this.currentSurvey.questions.push(question);
        this.updateForm();
    }

    onQuestionChanged(question: TSurveyRewardQuestion) {
        const index = this.currentSurvey.questions.findIndex((x) => x.order === question.order);
        if (index < 0) {
            return;
        }
        this.currentSurvey.questions[index] = question;
        this.updateForm();
    }

    onQuestionRemoved(order: number) {
        this.currentSurvey.questions = this.currentSurvey.questions.filter((q) => q.order !== order);
        this.updateForm();
    }

    addQuestion() {
        const questionsCount = this.currentSurvey.questions.length;
        this.currentSurvey.questions.push({
            question: '',
            answers: [] as TSurveyRewardAnswer[],
            order: questionsCount ? this.currentSurvey.questions[questionsCount - 1].order + 1 : 0,
            surveyRewardId: this.reward && this.reward._id ? this.reward._id : '',
            createdAt: new Date(),
            updatedAt: new Date(),
        } as TSurveyRewardQuestion);
    }

    updateForm() {
        this.questions = this.currentSurvey.questions;
    }

    onSubmit() {
        if (!this.isFormValid) {
            return;
        }
        this.isLoading = true;
        this.currentSurvey.title = this.title;
        this.currentSurvey.description = this.description;
        this.currentSurvey.amount = this.amount;
        this.currentSurvey.poolId = this.pool._id;
        this.$store
            .dispatch(`surveyRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.currentSurvey,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
        this.currentSurvey = {} as TSurveyReward;
        this.questions = [];
        this.title = '';
        this.description = '';
        this.amount = 0;
        this.isLoading = false;
        this.$emit('submit');
    }
}
</script>
