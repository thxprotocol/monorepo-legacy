<template>
    <b-form-group class="mb-0">
        <b-form-group :label="`Answer #${order}`">
            <b-form-input v-model="answer" />
        </b-form-group>
        <b-form-group label="Correct:">
            <b-form-checkbox />
        </b-form-group>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {},
    computed: mapGetters({}),
})
export default class BaseFormGroupSurveyRewardQuestion extends Vue {
    @Prop() order!: number;

    answer: string | null = null;
    numAnswers = 0;

    mounted() {
        console.log('CIAO');
    }

    addQuestion() {
        this.numAnswers += 1;
    }

    removeQuestion() {
        this.numAnswers -= 1;
    }
}
</script>
