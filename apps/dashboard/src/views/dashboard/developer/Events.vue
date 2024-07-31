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
                <b-form-group label-class="d-flex align-items-center justify-content-between">
                    <template #label>
                        Search Events
                        <b-dropdown
                            size="sm"
                            variant="light"
                            class="ml-auto"
                            menu-class="w-100"
                            toggle-class="justify-content-between align-items-center d-flex form-control"
                        >
                            <template #button-content> Filter events </template>
                            <b-dropdown-item :key="key" v-for="(event, key) of eventList.metadata.eventTypes">
                                {{ event }}
                            </b-dropdown-item>
                        </b-dropdown>
                    </template>

                    <BTable hover :items="events" show-empty responsive="lg" class="flex-grow-1">
                        <!-- Head formatting -->
                        <template #head(participant)> Participant </template>
                        <template #head(name)> Name </template>
                        <template #head(createdAt)> Created </template>

                        <!-- Cell formatting -->
                        <template #cell(participant)="{ item }">
                            <BaseParticipantAccount v-if="item.participant" :plain="true" :account="item.participant" />
                        </template>
                        <template #cell(name)="{ item }">
                            <code>{{ item.name }}</code>
                        </template>
                        <template #cell(createdAt)="{ item }">
                            <small class="text-muted">
                                {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                            </small>
                        </template>
                    </BTable>

                    <div class="d-flex">
                        <b-pagination
                            v-if="eventList"
                            @change="onChangePage"
                            v-model="page"
                            first-number
                            last-number
                            class="mx-auto"
                            size="sm"
                            :total-rows="eventList.total"
                            :per-page="limit"
                        />
                    </div>
                </b-form-group>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import BaseCode from '@thxnetwork/dashboard/components/BaseCode.vue';
import BaseParticipantAccount from '@thxnetwork/dashboard/components/BaseParticipantAccount.vue';

const exampleCode = `await thx.events.create({
    event: 'sign_up',
    identity: '36d33a59-5398-463a-ac98-0f7d9b201648',
});
`;

@Component({
    components: {
        BaseCode,
        BaseParticipantAccount,
    },
    computed: mapGetters({
        eventList: 'developer/events',
    }),
})
export default class DeveloperEventsView extends Vue {
    eventList!: TEventState;
    pools!: IPools;
    code = exampleCode;
    page = 1;
    limit = 10;
    format = format;

    get events() {
        return this.eventList.results.map((event: TEvent) => ({
            name: event.name,
            participant: event.account,
            createdAt: event.createdAt,
        }));
    }

    mounted() {
        this.listEvents();
    }

    async listEvents() {
        await this.$store.dispatch('developer/listEvents', { page: this.page, limit: this.limit });
    }

    onChangePage(page: number) {
        this.page = page;
        this.listEvents();
    }
}
</script>
