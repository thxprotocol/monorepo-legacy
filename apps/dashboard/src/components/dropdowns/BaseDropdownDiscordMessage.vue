<template>
    <div>
        <b-alert show variant="info" v-if="!guilds.length">
            <p class="mb-2">
                <i class="fas fa-exclamation-circle mr-1" />
                Please invite
                <b-link target="_blank" :href="discordBotInviteUrl">
                    THX Bot
                    <i class="fas fa-external-link-alt" />
                </b-link>
                and run <code>/thx connect</code>.
            </p>
            <b-button :disabled="isLoading" size="sm" variant="dark" class="rounded-pill" block @click="onClickRetry">
                <b-spinner small variant="light" v-if="isLoading" />
                <template v-else>Check again</template>
            </b-button>
        </b-alert>
        <template v-else>
            <b-form-group label="Server">
                <b-form-select v-model="guild">
                    <b-form-select-option :key="key" v-for="(g, key) of guilds" :value="guild">
                        {{ g.name }}
                    </b-form-select-option>
                </b-form-select>
            </b-form-group>
            <b-form-group label="Daily Limit" description="Maximum amount of eligible messages per day.">
                <b-form-input @change="onChangeLimit" :value="limit" />
            </b-form-group>
            <b-form-group label="Restart" description="Amount of days before the quest restarts.">
                <b-form-input @change="onChangeDays" :value="days" />
            </b-form-group>
        </template>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { DISCORD_BOT_INVITE_URL } from '@thxnetwork/dashboard/config/constants';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class BaseDropdownDiscordMessage extends Vue {
    isLoading = false;
    serverId = '';
    limit = 5;
    days = 7;
    guild = null;
    discordBotInviteUrl = DISCORD_BOT_INVITE_URL;

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;
    @Prop({ required: false }) amount!: number;

    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get guilds() {
        if (!this.pool) return [];
        return this.pool.guilds;
    }

    mounted() {
        this.serverId = this.content
            ? this.content
            : this.pool.guilds.length
            ? this.pool.guilds[0].guildId
            : this.serverId;
        this.limit = this.contentMetadata.length ? JSON.parse(this.contentMetadata).limit : this.limit;
        this.days = this.contentMetadata.length ? JSON.parse(this.contentMetadata).days : this.days;
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.update();
    }

    onChangeDays(days: number) {
        this.days = days;
        this.update();
    }

    update() {
        this.$emit('selected', {
            content: this.serverId,
            contentMetadata: {
                serverId: this.serverId,
                limit: this.limit,
                days: this.days,
            },
        });
    }

    async onClickRetry() {
        this.isLoading = true;
        await this.$store.dispatch('pools/read', this.pool._id);
        this.isLoading = false;
    }
}
</script>
