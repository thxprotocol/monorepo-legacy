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
        <b-spinner v-if="isLoadingGuilds" variant="gray" small />
        <b-button v-else-if="!guilds.length" variant="light" block>Connect THX Bot</b-button>
        <template v-else>
            <BaseFormGroup
                required
                label="Discord Role"
                tooltip="Make sure THX Bot is invited to your server and has permissions to read and assign roles."
                :key="key"
                v-for="(guild, key) of guilds"
            >
                <BaseDropdownDiscordRole
                    class="mb-1"
                    @click="discordRoleId = $event.id"
                    :role-id="discordRoleId"
                    :guild="guild"
                />
                <template #description>
                    Available roles in <strong>{{ guild.name }}</strong>
                </template>
            </BaseFormGroup>
        </template>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TGuildState } from '@thxnetwork/dashboard/store/modules/pools';
import { RewardVariant } from '@thxnetwork/common/enums';
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
    @Prop({ required: false }) reward!: TRewardDiscordRole;

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
        this.isLoadingGuilds = false;
    }

    async onSubmit(payload: TReward) {
        try {
            this.isLoading = true;
            await this.$store.dispatch(`pools/${this.reward ? 'update' : 'create'}Reward`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.DiscordRole,
                discordRoleId: this.discordRoleId,
            });
            this.$emit('submit', { isPublished: payload.isPublished });
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
