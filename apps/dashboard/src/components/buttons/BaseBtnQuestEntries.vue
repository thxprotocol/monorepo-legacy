<template>
    <b-link v-b-modal="`modalQuestSocialEntries${quest._id}`">
        <b-spinner v-if="isLoading" small variant="primary" />
        <template v-else>
            <small><i class="fas text-muted fa-users mr-1" /></small>
            {{ questEntries.total }}/{{ '&infin;' }}
        </template>
        <BaseModalQuestSocialEntries :id="`modalQuestSocialEntries${quest._id}`" :quest="quest" />
    </b-link>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import type { TQuestSocial } from '@thxnetwork/common/lib/types';
import { mapGetters } from 'vuex';
import { TQuestEntryState } from '../../store/modules/pools';
import BaseModalQuestSocialEntries from '@thxnetwork/dashboard/components/modals/BaseModalQuestSocialEntries.vue';

@Component({
    components: {
        BaseModalQuestSocialEntries,
    },
    computed: mapGetters({
        entriesList: 'pools/entries',
    }),
})
export default class BaseBtnQuestEntries extends Vue {
    isLoading = false;
    entriesList!: TQuestEntryState;

    @Prop() quest!: TQuestSocial;

    @Watch('quest')
    onQuestChange(newQuest: TQuestSocial) {
        this.getEntries(newQuest);
    }

    mounted() {
        this.getEntries(this.quest);
    }

    async getEntries(quest: TQuestSocial) {
        this.isLoading = true;
        await this.$store.dispatch('pools/listEntries', { quest, page: 1, limit: 25 });
        this.isLoading = false;
    }

    get questEntries() {
        if (!this.entriesList[this.quest.poolId]) return { total: 0, results: [] };
        if (!this.entriesList[this.quest.poolId][this.quest._id]) return { total: 0, results: [] };
        return this.entriesList[this.quest.poolId][this.quest._id];
    }
}
</script>
