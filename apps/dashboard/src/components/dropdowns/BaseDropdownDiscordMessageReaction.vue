<template>
    <div>
        <b-form-group label="Server">
            <b-form-select v-model="guild" class="mb-3">
                <b-form-select-option :key="key" v-for="(guild, key) of guilds" :value="guild">
                    {{ guild.guildId }}
                </b-form-select-option>
            </b-form-select>
        </b-form-group>
        <b-form-group
            label="Daily Limit"
            description="Determine the max amount of eligible messages reactions per day."
        >
            <b-form-input @change="onChange" :value="limit" />
        </b-form-group>
        <b-alert show variant="info">
            <i class="fas fa-question-circle" />
            Discord members will be able to claim a max of {{ 50 * limit }} points on a weekly basis.
        </b-alert>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class BaseDropdownDiscordGuilds extends Vue {
    serverId = '';
    limit = 0;
    guild = null;

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
        this.serverId = this.content ? this.content : this.serverId;
        this.limit = this.contentMetadata ? this.contentMetadata.limit : this.limit;
    }

    onChange(limit: number) {
        this.limit = limit;
        this.$emit('selected', {
            content: this.serverId,
            contentMetadata: {
                serverId: this.serverId,
                limit: this.limit,
            },
        });
    }
}
</script>
