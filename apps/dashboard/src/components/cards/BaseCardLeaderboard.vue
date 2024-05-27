<template>
    <b-list-group class="mb-3" :style="{ opacity: isLoadingLeaderboard ? 0.5 : 1 }">
        <b-list-group-item
            v-for="(result, key) of leaderboard"
            :key="key"
            class="d-flex justify-content-between align-items-center pl-3"
        >
            <div class="d-flex center-center">
                <div class="mr-3 text-gray">{{ result.rank }}</div>
                <BaseParticipantAccount :account="result.account" />
            </div>
            <div class="ml-auto text-right">
                <i class="fa fa-tasks mr-2" style="font-size: 0.8rem" />
                <strong> {{ result.questEntryCount }} </strong>
            </div>
            <div style="min-width: 75px" class="text-right">
                <strong> {{ result.score }} </strong>
            </div>
        </b-list-group-item>
        <b-list-group-item v-if="!leaderboard.length">
            <p class="mb-0 text-gray">Could not find any campaign participants yet!</p>
        </b-list-group-item>
        <b-list-group-item>
            <b-link :to="`/pool/${pool._id}/participants`">All Participants</b-link>
        </b-list-group-item>
    </b-list-group>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import BaseParticipantAccount from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';

@Component({
    components: {
        BaseParticipantAccount,
    },
})
export default class BaseCardLeaderboard extends Vue {
    limit = 10;
    isLoadingLeaderboard = false;
    leaderboard: { score: number; questEntryCount: number; rank: number; account: TAccount }[] = [];

    @Prop() pool!: TPool;
    @Prop() startDate!: Date;
    @Prop() endDate!: Date;

    mounted() {
        this.getLeaderboard();
    }

    @Watch('startDate')
    onChangeStartDate() {
        this.getLeaderboard();
    }

    @Watch('endDate')
    onChangeEndDate() {
        this.getLeaderboard();
    }

    async getLeaderboard() {
        this.isLoadingLeaderboard = true;
        this.leaderboard = await this.$store.dispatch('pools/getLeaderboard', {
            pool: this.pool,
            startDate: this.startDate,
            endDate: this.endDate,
            limit: this.limit,
        });
        this.isLoadingLeaderboard = false;
    }
}
</script>
