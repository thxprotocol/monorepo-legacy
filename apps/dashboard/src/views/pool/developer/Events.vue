<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Events</strong>
                <p class="text-muted">
                    Search events linked to identities that are created through an external system.
                </p>
                <BaseCode :codes="[code]" :languages="['JavaScript']" />
            </b-col>
            <b-col md="8">
                <b-form-group>
                    <div class="d-flex justify-content-between align-items-center">
                        <label> Search Events </label>
                        <b-dropdown
                            variant="light"
                            class="ml-auto"
                            menu-class="w-100"
                            toggle-class="justify-content-between align-items-center d-flex form-control"
                        >
                            <template #button-content> Filter events </template>
                            <b-dropdown-item :key="key" v-for="(event, key) of pool.events">
                                {{ event }}
                            </b-dropdown-item>
                        </b-dropdown>
                    </div>
                    <hr />
                    <BTable hover :items="events" show-empty responsive="lg" class="flex-grow-1">
                        <!-- Head formatting -->
                        <template #head(name)> Name </template>
                        <template #head(identity)> Identity </template>
                        <template #head(createdAt)> Created </template>

                        <!-- Cell formatting -->
                        <template #cell(name)="{ item }">
                            <span>{{ item.name }}</span>
                        </template>
                        <template #cell(identity)="{ item }">
                            <code>{{ item.identity ? item.identity.uuid : '' }}</code>
                        </template>
                        <template #cell(createdAt)="{ item }">
                            <small class="text-muted">
                                {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                            </small>
                        </template>
                    </BTable>
                </b-form-group>
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
import BaseCode from '@thxnetwork/dashboard/components/BaseCode.vue';
import { TEvent } from '@thxnetwork/common/lib/types/interfaces';

const exampleCode = `await thx.events.create({
    event: 'sign_up',
    identity: '36d33a59-5398-463a-ac98-0f7d9b201648',
});
`;

@Component({
    components: {
        BaseCode,
    },
    computed: mapGetters({
        poolEvents: 'pools/events',
        pools: 'pools/all',
    }),
})
export default class DeveloperEventsView extends Vue {
    poolEvents!: TEventState;
    pools!: IPools;
    code = exampleCode;
    page = 1;
    limit = 10;
    format = format;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get events() {
        if (!this.poolEvents || !this.poolEvents[this.pool._id]) return [];
        return this.poolEvents[this.pool._id].results.map((event: TEvent) => ({
            name: event.name,
            identity: event.identity,
            createdAt: event.createdAt,
        }));
    }

    mounted() {
        this.listEvents();
    }

    listEvents() {
        this.$store.dispatch('pools/listEvents', { pool: this.pool, page: this.page, limit: this.limit });
    }
}
</script>
