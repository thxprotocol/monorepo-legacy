<template>
    <b-link v-b-modal="`modalQuestSocialEntries${quest._id}`">
        <b-spinner v-if="isLoading" small variant="primary" />
        <template v-else>
            <small><i class="fas text-muted fa-users mr-1" /></small>
            {{ questEntries.length }}
        </template>
        <BaseModalQuestSocialEntries
            :id="`modalQuestSocialEntries${quest._id}`"
            :entries="questEntries"
            :pool="pool"
            :quest="quest"
        />
    </b-link>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import type { TPointReward, TPool } from '@thxnetwork/common/lib/types';
import { mapGetters } from 'vuex';
import { TQuestEntryState } from '../../store/modules/pools';
import BaseModalQuestSocialEntries from '@thxnetwork/dashboard/components/modals/BaseModalQuestSocialEntries.vue';

@Component({
    components: {
        BaseModalQuestSocialEntries,
    },
    computed: mapGetters({
        entries: 'pools/entries',
    }),
})
export default class BaseBtnQuestEntries extends Vue {
    isLoading = false;
    entries!: TQuestEntryState;

    @Prop() pool!: TPool;
    @Prop() quest!: TPointReward;

    @Watch('quest')
    onQuestChange(newQuest: TPointReward) {
        this.getEntries(newQuest);
    }

    mounted() {
        this.getEntries(this.quest);
    }

    getEntries(quest: TPointReward) {
        this.isLoading = true;
        this.$store.dispatch('pools/listEntries', quest).then(() => (this.isLoading = false));
    }

    get questEntries() {
        if (!this.entries || !this.entries[this.pool._id] || !this.entries[this.pool._id][this.quest._id]) return [];
        return this.entries[this.pool._id][this.quest._id];
    }
}
</script>
