<template>
    <b-link v-b-modal="`modalQuestSocialEntries${quest._id}`">
        <b-badge variant="light" class="p-2 mr-2 d-inline font-weight-normal">
            <b-spinner v-if="isLoading" small variant="primary" />
            <template v-else>
                <i class="fas text-muted fa-users mr-2" />
                <span class="font-weight-bold"> {{ questEntries.length }}</span>
                <BaseModalQuestSocialEntries
                    :id="`modalQuestSocialEntries${quest._id}`"
                    :entries="questEntries"
                    :pool="pool"
                    :quest="quest"
                />
            </template>
        </b-badge>
    </b-link>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { TPointReward, TPool } from '@thxnetwork/common/lib/types';
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

    mounted() {
        this.getEntries(this.quest);
    }

    @Watch('quest')
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
