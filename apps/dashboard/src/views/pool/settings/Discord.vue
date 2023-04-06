<template>
    <div>
        <b-form-row v-if="urlDiscordBotInstall">
            <b-col md="4">
                <strong>Bot</strong>
                <p class="text-muted">Install THX Bot to increase engagement in your Discord server.</p>
            </b-col>
            <b-col md="8">
                <b-alert show variant="info" class="d-flex align-items-center">
                    <i class="fab fa-discord mr-2"></i>
                    Install THX Bot to increase engagement in your Discord server.
                    <b-button class="rounded-pill ml-auto" variant="primary" :href="urlDiscordBotInstall">
                        Install
                        <i class="fas fa-chevron-right"></i>
                    </b-button>
                </b-alert>
            </b-col>
        </b-form-row>
        <b-form-row>
            <b-col md="4">
                <strong>Announcements</strong>
                <p class="text-muted">Discord webhook URL for publishing notifications about newly created rewards.</p>
            </b-col>
            <b-col md="8">
                <b-form-group label="Webhook URL" description="">
                    <b-form-input
                        :value="pool.settings.discordWebhookUrl"
                        @change="onChangeDiscordWebhookUrl"
                    ></b-form-input>
                </b-form-group>
            </b-col>
        </b-form-row>
    </div>
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
            `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=133152&scope=bot`
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
