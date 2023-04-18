<template>
    <b-form-group class="mb-0">
        <div class="d-flex justify-content-between w-10">
            <b-form-group :label="`Answer #${answer.order + 1}`">
                <b-form-input v-model="currentAnswer.value" @change="onAnswerChanged" />
            </b-form-group>
            <b-form-group label="Correct:">
                <b-form-checkbox v-model="currentAnswer.correct" @change="onAnswerChanged" />
            </b-form-group>
            <button
                type="button"
                class="btn btn-primary rounded-pill btn-sm"
                v-on:click="$emit('answerRemoved', answer.order)"
            >
                - answer
            </button>
        </div>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TSurveyRewardAnswer } from '@thxnetwork/types/interfaces';

@Component({
    components: {},
    computed: mapGetters({}),
})
export default class BaseFormGroupSurveyRewardQuestion extends Vue {
    @Prop() answer!: TSurveyRewardAnswer;

    currentAnswer: TSurveyRewardAnswer = {} as TSurveyRewardAnswer;

    mounted() {
        this.currentAnswer = this.answer;
    }

    onAnswerChanged() {
        this.$emit('answerChanged', this.currentAnswer);
    }
}
</script>
