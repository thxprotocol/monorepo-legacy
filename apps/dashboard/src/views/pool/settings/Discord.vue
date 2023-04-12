<template>
    <div></div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { mapGetters } from 'vuex';
import { TBrand } from '@thxnetwork/dashboard/store/modules/brands';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { DISCORD_CLIENT_ID } from '@thxnetwork/dashboard/utils/secrets';

@Component({
    computed: {
        ...mapGetters({
            brands: 'brands/all',
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsView extends Vue {
    ChainId = ChainId;
    loading = true;
    chainInfo = chainInfo;
    profile!: IAccount;
    chainId: ChainId = ChainId.PolygonMumbai;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    logoImgUrl = '';
    backgroundImgUrl = '';

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get urlDiscordBotInstall() {
        return (
            DISCORD_CLIENT_ID &&
            `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=133120&scope=bot`
        );
    }

    async onChangeDiscordWebhookUrl(discordWebhookUrl: string) {
        this.loading = true;
        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { settings: { discordWebhookUrl } },
        });
        this.loading = false;
    }
}
</script>
