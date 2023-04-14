<template>
    <b-form-group class="mb-0">
        <hr />
        <b-form-group :label="`Question #${order}`">
            <b-form-input v-model="question" />
        </b-form-group>
        <button
            v-if="addAnswerEnabled"
            type="button"
            class="btn btn-primary rounded-pill m-auto"
            v-on:click="addQuestion()"
        >
            Add Answer
        </button>
        <div class="mt-3">
            <BaseFormGroupSurveyRewardAnswer v-for="n in numAnswers" :key="n" :order="n" />
        </div>
    </b-form-group>
</template>

<script lang="ts">
import { TSurveyReward } from '@thxnetwork/types/interfaces/SurveyReward';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormGroupSurveyRewardAnswer from '../form-group/BaseFormGroupSurveyRewardAnswer.vue';
@Component({
    components: {
        BaseFormGroupSurveyRewardAnswer,
    },
    computed: mapGetters({}),
})
export default class BaseFormGroupSurveyRewardQuestion extends Vue {
    @Prop() reward!: TSurveyReward;
    @Prop() order!: number;

    question: string | null = null;
    numAnswers = 0;

    get addAnswerEnabled() {
        return this.question && this.question.length > 0;
    }

    mounted() {
        console.log('CIAO');
    }

    addQuestion() {
        this.numAnswers += 1;
    }

    removeQuestion() {
        this.numAnswers += 1;
    }
}
</script>
