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
    page = 1;
    limit = 10;
    result = {
        results: [],
        total: 0,
    };
    selectedLocks: TQuestLock[] = [];
    questList!: TQuest[];

    @Prop() pool!: TPool;
    @Prop() locks!: TQuestLock[];

    get quests() {
        if (!this.questList[this.pool._id]) return [];
        return this.questList[this.pool._id].results;
    }

    get options() {
        return this.quests.map((quest: TQuest) => {
            return { text: quest.title, value: { variant: quest.variant, questId: quest._id } };
        });
    }

    async mounted() {
        this.selectedLocks = this.locks.map((lock: TQuestLock) => {
            const quest = this.quests.find((q) => q._id === lock.questId);
            return { variant: quest.variant, questId: quest._id };
        });
    }

    async getQuests() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listQuests', {
            page: this.page,
            pool: this.pool,
            limit: this.limit,
            isPublished: true,
        });
        this.isLoading = false;
    }

    onInput(locks: TQuestLock[]) {
        this.$emit('change-locks', locks);
    }
}
</script>
