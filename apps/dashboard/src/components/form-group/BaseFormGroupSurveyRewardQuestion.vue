<template>
    <div>
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle="`collapse-card-survey-question_${question.order}`"
        >
            <strong>Question #{{ question.order + 1 }}</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse :id="`collapse-card-survey-question_${question.order}`" v-model="isVisible">
            <b-form-group class="mb-0">
                <div class="d-flex justify-content-between">
                    <b-form-group>
                        <b-form-input
                            v-model="currentQuestion.question"
                            @change="$emit('questionChanged', currentQuestion)"
                        />
                    </b-form-group>
                    <b-form-group>
                        <button
                            v-if="addAnswerEnabled"
                            type="button"
                            class="btn btn-primary rounded-pill btn-sm"
                            v-on:click="addAnswer()"
                        >
                            + answer
                        </button>
                    </b-form-group>
                    <b-form-group>
                        <button
                            type="button"
                            class="btn btn-primary rounded-pill btn-sm"
                            v-on:click="$emit('questionRemoved', currentQuestion.order)"
                        >
                            - question
                        </button>
                    </b-form-group>
                </div>
                <div class="mt-3">
                    <BaseFormGroupSurveyRewardAnswer
                        v-for="a in currentQuestion.answers"
                        :key="a.order"
                        :answer="a"
                        @answerChanged="onAnswerChanged"
                        @answerRemoved="onAnswerRemoved"
                    />
                </div>
            </b-form-group>
        </b-collapse>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormGroupSurveyRewardAnswer from '../form-group/BaseFormGroupSurveyRewardAnswer.vue';
import { TSurveyRewardQuestion, TSurveyRewardAnswer } from '@thxnetwork/types/interfaces';
@Component({
    components: {
        BaseFormGroupSurveyRewardAnswer,
    },
    computed: mapGetters({}),
})
export default class BaseFormGroupSurveyRewardQuestion extends Vue {
    @Prop() isVisible!: boolean;
    @Prop() question!: TSurveyRewardQuestion;

    currentQuestion: TSurveyRewardQuestion = {} as TSurveyRewardQuestion;

    get addAnswerEnabled() {
        return this.question && this.question.question.length > 0;
    }

    mounted() {
        this.currentQuestion = this.question;
    }

    questionChanged() {
        this.$emit('questionChanged', this.currentQuestion);
    }

    onAnswerChanged(answer: TSurveyRewardAnswer) {
        const index = this.currentQuestion.answers.findIndex((x) => x.order === answer.order);
        if (index < 0) {
            return;
        }
        this.currentQuestion.answers[index] = answer;
        this.questionChanged();
    }

    onAnswerRemoved(order: number) {
        this.currentQuestion.answers = this.currentQuestion.answers.filter((a) => a.order !== order);
        this.questionChanged();
    }

    addAnswer() {
        const answersCount = this.currentQuestion.answers.length;
        this.currentQuestion.answers.push({
            value: '',
            correct: false,
            order: answersCount ? this.currentQuestion.answers[answersCount - 1].order + 1 : 0,
        });
        this.questionChanged();
    }
}
</script>
