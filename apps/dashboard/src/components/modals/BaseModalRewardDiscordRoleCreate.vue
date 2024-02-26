<template>
    <BaseModalRewardCreate
        @show="onShow"
        @submit="onSubmit"
        :pool="pool"
        :id="id"
        :reward="reward"
        :error="error"
        :is-loading="isLoading"
    >
        <b-form-group :label="`Discord Role (${guild.name})`" v-for="(guild, key) of guilds" :key="key">
            <BaseDropdownDiscordRole
                class="mb-1"
                @click="discordRoleId = $event.id"
                :role-id="discordRoleId"
                :guild="guild"
            />
        </b-form-group>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TGuildState } from '@thxnetwork/dashboard/store/modules/pools';
import type { TPool, TDiscordRoleReward, TBaseReward } from '@thxnetwork/types/interfaces';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';
import BaseDropdownDiscordRole from '../dropdowns/BaseDropdownDiscordRole.vue';

@Component({
    components: {
        BaseModalRewardCreate,
        BaseDropdownDiscordRole,
    },
    computed: mapGetters({
        guildsList: 'pools/guilds',
    }),
})
export default class ModalRewardCustomCreate extends Vue {
    isLoading = false;
    error = '';
    guildsList!: TGuildState;
    discordRoleId = '';
    isLoadingGuilds = false;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TDiscordRoleReward;

    get guilds() {
        if (!this.guildsList[this.pool._id]) return [];
        return Object.values(this.guildsList[this.pool._id]).filter((g) => g.isConnected);
    }

    async onShow() {
        await this.getGuilds();
        this.discordRoleId = this.reward ? this.reward.discordRoleId : this.discordRoleId;
    }

    async getGuilds() {
        this.isLoadingGuilds = true;
        await this.$store.dispatch('pools/listGuilds', this.pool);
        this.isLoadingGuilds = true;
    }

    async onSubmit(payload: TBaseReward) {
        try {
            this.isLoading = true;

            await this.$store.dispatch(`discordRoleRewards/${this.reward ? 'update' : 'create'}`, {
                ...this.reward,
                ...payload,
                discordRoleId: this.discordRoleId,
            });
            this.$bvModal.hide(this.id);
            this.$emit('submit');
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
