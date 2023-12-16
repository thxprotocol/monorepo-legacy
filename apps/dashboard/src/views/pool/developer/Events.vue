<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Events</strong>
                <p class="text-muted">An overview of events that are created by your system.</p>
            </b-col>
            <b-col md="8">
                <b-list-group>
                    <b-list-group-item class="py-1 d-flex" :key="key" v-for="(event, key) of events[pool._id].results">
                        <div>{{ event.name }}</div>
                        <div class="ml-auto">{{ format(new Date(event.createdAt), 'dd-MM-yyyy HH:mm') }}</div>
                    </b-list-group-item>
                </b-list-group>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TEventState } from '@thxnetwork/dashboard/store/modules/pools';
import { format } from 'date-fns';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        events: 'pools/events',
    }),
})
export default class DeveloperEventsView extends Vue {
    pools!: IPools;
    events!: TEventState;
    format = format;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        this.$store.dispatch('pools/listEvents', { pool: this.pool, page: 1, limit: 25 });
    }
}
</script>
