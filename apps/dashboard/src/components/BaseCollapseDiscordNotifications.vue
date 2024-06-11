<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            @click="isCollapsed = !isCollapsed"
        >
            <strong>{{ guild.name }}</strong>
            <i :class="`fa-chevron-${isCollapsed ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-webhook" v-model="isCollapsed">
            <hr class="mt-0" />
            <div class="px-3 pb-3">
                <b-row>
                    <b-col md="6">
                        <BaseCardDiscordNotification
                            @update="update"
                            variant="questCreate"
                            header="Quest Published"
                            tooltip="Will be triggered when you publish a quest."
                            :guild="guild"
                        />
                    </b-col>
                    <b-col md="6">
                        <BaseCardDiscordNotification
                            @update="update"
                            variant="questEntryCreate"
                            header="Quest Entry Created"
                            tooltip="Will be triggered when a campaign participant completes a quest."
                            :guild="guild"
                        />
                    </b-col>
                </b-row>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseCardDiscordNotification from '@thxnetwork/dashboard/components/BaseCardDiscordNotification.vue';

@Component({
    components: {
        BaseCardDiscordNotification,
    },
})
export default class BaseCollapseDiscordNotifications extends Vue {
    isCollapsed = true;

    @Prop() guild!: TDiscordGuild;

    update(guild: TDiscordGuild) {
        this.$emit('update', guild);
    }
}
</script>
