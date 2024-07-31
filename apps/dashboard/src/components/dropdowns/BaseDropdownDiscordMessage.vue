<template>
    <div>
        <b-alert show variant="primary" v-if="!guilds.length">
            <i class="fas fa-exclamation-circle mr-1" />
            Please
            <b-link :to="`/campaign/${pool._id}/integrations/discord`"> invite THX Bot </b-link>
            to your server.
        </b-alert>
        <template v-else>
            <BaseFormGroup
                required
                label="Server"
                :description="!guilds.length ? 'Make sure THX Bot is connected and has sufficient permissions.' : ''"
                tooltip="Select the server the campaign participant is required to join for this quest."
            >
                <b-form-select v-model="guild">
                    <b-form-select-option :key="key" v-for="(g, key) of guilds" :value="guild">
                        {{ g.name }}
                    </b-form-select-option>
                </b-form-select>
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Channels"
                description="Use cmd+click or ctrl+click to select more than one channel to track."
                tooltip="Select the channels where we should track messages for your campaign participants."
            >
                <b-form-select @change="onChangeChannels" :value="channels" :options="channelOptions" multiple />
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Daily Limit"
                tooltip="Maximum amount of eligible messages per day. Will only allow points to be claimed up to a max. amount of messages."
            >
                <b-form-input @change="onChangeLimit" :value="limit" />
            </BaseFormGroup>
            <BaseFormGroup
                required
                label="Restart"
                tooltip="Amount of days before the quest restarts. Campaign participants will loose the points they did not claim so far."
            >
                <b-form-input @change="onChangeDays" :value="days" />
            </BaseFormGroup>
        </template>
    </div>
</template>

<script lang="ts">
import { IPools, TGuildState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { DISCORD_BOT_INVITE_URL } from '@thxnetwork/dashboard/config/constants';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        guildList: 'pools/guilds',
    }),
})
export default class BaseDropdownDiscordMessage extends Vue {
    isLoading = false;
    serverId = '';
    limit = 5;
    days = 7;
    guild = null;
    discordBotInviteUrl = DISCORD_BOT_INVITE_URL;
    channels: string[] = [];
    guildList!: TGuildState;

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;
    @Prop({ required: false }) amount!: number;

    pools!: IPools;

    get channelOptions() {
        const guild = this.guilds.find((g) => g.guildId === this.serverId);
        if (!guild) return [];
        return guild.channels.map((c) => ({ value: c.channelId, text: c.name }));
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get guilds() {
        if (!this.guildList[this.$route.params.id]) return [];
        return Object.values(this.guildList[this.$route.params.id]).filter((guild: TDiscordGuild) => guild.isConnected);
    }

    async mounted() {
        await this.$store.dispatch('pools/listGuilds', this.pool);

        this.serverId = this.content ? this.content : this.guilds.length ? this.guilds[0].guildId : this.serverId;
        if (this.contentMetadata) {
            const { limit, days, channels } = this.contentMetadata;
            this.limit = limit || this.limit;
            this.days = days || this.days;
            this.channels = channels || this.channels;
        }
    }

    onChangeChannels(channels: string[]) {
        this.channels = channels;
        this.update();
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
                channels: this.channels,
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
