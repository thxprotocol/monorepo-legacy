<template>
    <BaseFormGroup
        label="Required Quest Entries"
        tooltip="Participants will only be able to complete this quest after completing the selected quests."
    >
        <b-form-select @input="onInput" v-model="selectedLocks" :options="options" multiple />
    </BaseFormGroup>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormGroup from './BaseFormGroup.vue';

@Component({
    components: {
        BaseFormGroup,
    },
    computed: mapGetters({
        questList: 'pools/quests',
    }),
})
export default class BaseFormGroupQuestLocks extends Vue {
    isLoading = false;
    isVisible = true;
    error = '';
    page = 1;
    limit = 10;
    result = {
        results: [],
        total: 0,
    };
    selectedLocks: TQuestLock[] = [];
    quests: TQuest[] = [];

    @Prop() pool!: TPool;
    @Prop() locks!: TQuestLock[];

    get options() {
        return this.quests.map((quest: TQuest) => {
            return { text: quest.title, value: { variant: quest.variant, questId: quest._id } };
        });
    }

    async mounted() {
        await this.getQuests();

        this.selectedLocks = this.locks
            .map((lock: TQuestLock) => {
                const quest = this.quests.find((q) => q._id === lock.questId);
                if (!quest) return;
                return { variant: quest.variant, questId: quest._id };
            })
            .filter((lock) => !!lock);
    }

    async getQuests() {
        this.isLoading = true;
        try {
            this.quests = await this.$store.dispatch('pools/listQuestsAll', this.pool);
        } catch (error: any) {
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }

    onInput(locks: TQuestLock[]) {
        this.$emit('change-locks', locks);
    }
}
</script>
