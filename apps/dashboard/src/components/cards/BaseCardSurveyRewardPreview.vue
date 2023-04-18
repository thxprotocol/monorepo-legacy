<template>
    <b-card body-class="bg-light p-2">
        <strong>Survey Preview</strong>
        <ul>
            <li v-for="(question, key) in questions" :key="key">
                {{ question.question }}
                <ul>
                    <li v-for="(answer, key) in question.answers" :key="key">
                        {{ answer.value }} <i v-if="answer.correct" class="fas fa-check"></i>
                    </li>
                </ul>
            </li>
        </ul>
    </b-card>
</template>

<script lang="ts">
import { TSurveyReward } from '@thxnetwork/types/interfaces/SurveyReward';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TSurveyRewardQuestion, TSurveyRewardAnswer } from '@thxnetwork/types/interfaces';

@Component({})
export default class BaseCardSurveyRewardPreview extends Vue {
    @Prop() questions!: TSurveyRewardQuestion[];
}
</script>
