<template>
    <div class="d-flex align-items-center justify-content-center bg-dark p-5">
        <div class="flex-row text-white">
            <div v-if="isLoading && !error" class="text-center">
                <b-spinner variant="secondary" large /><br />
                <span class="text-muted mt-2">{{ statusText }}</span>
            </div>
            <template v-else>
                <template v-if="isClaimInvalid">
                    <b-alert show variant="info">
                        <i class="fas fa-info-circle mr-2"></i>
                        {{ error }}
                    </b-alert>
                    <b-button block variant="primary" class="rounded-pill" @click="goToWallet"> Continue </b-button>
                </template>
                <template v-if="isClaimFailed">
                    <b-alert show variant="danger">
                        Oops, we did not manage to claim your token reward at this time, please visit your claim URL or
                        scan your QR code again.
                    </b-alert>
                    <b-button block variant="primary" class="rounded-pill" @click="claimReward"> Try again </b-button>
                </template>
            </template>

            <template v-if="!isLoading && claimedReward">
                <template v-if="claimedReward.erc20">
                    <div class="img-treasure" :style="`background-image: url(${defaultImgUrl});`"></div>
                    <h2 class="text-secondary text-center my-3">
                        <strong>Congratulations!</strong> You have received
                        <strong>{{ claimedReward.withdrawal.amount }} {{ claimedReward.erc20.symbol }}</strong>
                    </h2>
                    <p class="lead text-center">Continue to your wallet and view your balance.<br /></p>
                </template>
                <b-row v-if="claimedReward.erc721">
                    <b-col xs="12" md="6" class="d-flex align-items-center justify-content-center">
                        <div>
                            <b-spinner v-if="isNftImageLoading" variant="light" />
                        </div>
                        <img
                            :class="`w-100 ${isNftImageLoading ? 'd-none' : 'd-block'}`"
                            :src="imgUrl"
                            @load="isNftImageLoading = false"
                        />
                    </b-col>
                    <b-col xs="12" md="6">
                        <h2 class="text-secondary my-3"><strong>Congratulations!</strong> You have claimed an NFT</h2>
                        <p class="lead">
                            {{ claimedReward.erc721.name }}<br />
                            <small class="text-muted">{{ claimedReward.erc721.description }}</small>
                        </p>
                    </b-col>
                </b-row>
                <hr />
                <b-button class="rounded-pill" block variant="primary" @click="goToWallet" type="submit">
                    Continue
                </b-button>
            </template>
        </div>
        <b-card
            class="mb-3"
            v-if="
                reward &&
                [
                    RewardConditionPlatform.Google,
                    RewardConditionPlatform.Twitter,
                    RewardConditionPlatform.Discord,
                ].includes(reward.platform) &&
                !hasValidAccessToken
            "
        >
            <div v-if="reward.platform === RewardConditionPlatform.Twitter">
                <div class="mb-3 d-flex align-items-center">
                    <img height="30" class="mr-3" :src="require('../../public/assets/img/thx_twitter.png')" alt="" />
                    <strong> Twitter </strong>
                </div>
            </div>
            <div v-if="reward.platform === RewardConditionPlatform.Google">
                <div class="mb-3 d-flex align-items-center">
                    <img height="30" class="mr-3" :src="require('../../public/assets/img/thx_youtube.png')" alt="" />
                    <strong> Youtube </strong>
                </div>
            </div>
            <div v-if="reward.platform === RewardConditionPlatform.Discord">
                <div class="mb-3 d-flex align-items-center">
                    <img height="30" class="mr-3" :src="require('../../public/assets/img/thx_discord.png')" alt="" />
                    <strong> Discord </strong>
                </div>
            </div>
            <hr />
            <b-alert varian="info" show>
                We will use your social account to verify if you
                <b-link v-if="reward.itemUrl" target="_blank" :href="reward.itemUrl.href" class="font-weight-bold">
                    {{ reward.itemUrl.label }}
                </b-link>
            </b-alert>
            <p class="text-muted">Please, connect to this platform and continue your claim.</p>
            <b-button @click="connect" variant="primary" block class="rounded-pill"> Connect </b-button>
        </b-card>
    </div>
</template>

<script lang="ts">
import { ERC721, TERC721Metadata, TERC721Token } from '@thxnetwork/wallet/store/modules/erc721';
import { Withdrawal } from '@thxnetwork/wallet/store/modules/withdrawals';
import { format } from 'date-fns';
import { User } from 'oidc-client-ts';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { UserProfile } from '../store/modules/account';
import { RewardConditionInteraction, RewardConditionPlatform, TERC20Perk, TERC721Perk } from '@thxnetwork/types/index';
import { TERC20 } from '../store/modules/erc20';
import { TWallet } from '../types/Wallet';
import { ChainId } from '@thxnetwork/sdk/types/enums/ChainId';
import poll from 'promise-poller';

const getChainId = (claim: TClaim) => {
    const { erc20, erc721 } = claim;
    return erc20 ? erc20.chainId : erc721.chainId;
};

type TClaim = {
    metadata: TERC721Metadata;
    reward:
        | (TERC20Perk & { itemUrl: { href: string; label: string } })
        | (TERC721Perk & { itemUrl: { href: string; label: string } });
    erc721: ERC721;
    erc20: TERC20;
};

@Component({
    computed: {
        ...mapState('erc721', ['erc721s']),
        ...mapGetters({
            privateKey: 'account/privateKey',
            profile: 'account/profile',
            user: 'account/user',
            networks: 'network/all',
            wallet: 'walletManagers/wallet',
        }),
    },
})
export default class Collect extends Vue {
    $confetti!: { start: (options: unknown) => void; stop: () => void };
    imgUrl = '';
    defaultImgUrl = require('@thxnetwork/wallet/../public/assets/img/thx_treasure.png');
    format = format;
    error = '';
    isLoading = true;
    isNftImageLoading = true;
    isClaimFailed = false;
    isClaimInvalid = false;
    claim: TClaim | null = null;
    claimedReward: (TClaim & { withdrawal: Withdrawal; token: TERC721Token; error?: string }) | null = null;
    state!: { claimUuid: string; rewardHash: string };
    statusText = 'Requesting information about your claim URL...';

    erc721s!: { [id: string]: ERC721 };
    user!: User;
    wallet!: TWallet;

    reward:
        | null
        | (TERC20Perk & { itemUrl: { href: string; label: string } })
        | (TERC721Perk & { itemUrl: { href: string; label: string } }) = null;
    profile!: UserProfile;
    hasValidAccessToken = false;
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;

    get erc721() {
        if (!this.claim) return null;
        return this.erc721s[this.claim.erc721._id];
    }

    async mounted() {
        if (!this.user || !this.user.state) {
            this.$router.push({ path: 'coins' });
        }

        // Store state locally to solve type issues
        this.state = this.user.state as { claimUuid: string; rewardHash: string };

        // Get claim information based on url claimUuid or rewardHash. rewardHash will be deprecated
        this.claim = await this.$store.dispatch('assetpools/getClaim', this.state.claimUuid);
        if (!this.claim) return;

        this.reward = this.claim.reward;

        // Set correct chain
        const chainId = getChainId(this.claim);
        this.$store.commit('setChainId', chainId);

        // Wait for wallet to be deployed
        await this.waitForAddress(this.user.profile.sub, chainId);

        // If no condition applies claim directly
        if (!this.claim.reward.platform) {
            return this.claimReward();
        }

        // Check validity of current access token
        switch (this.claim.reward.platform) {
            case RewardConditionPlatform.Google:
                this.hasValidAccessToken = this.profile.youtubeManageAccess;
                break;
            case RewardConditionPlatform.Twitter:
                this.hasValidAccessToken = this.profile.twitterAccess;
                break;
            case RewardConditionPlatform.Discord:
                this.hasValidAccessToken = this.profile.discordAccess;
        }

        // Claim directly if condition applies and access token is valid
        if (!this.hasValidAccessToken) {
            this.isLoading = false;
        } else {
            this.claimReward();
        }
    }

    async waitForAddress(sub: string, chainId: ChainId) {
        const taskFn = async () => {
            await this.$store.dispatch('walletManagers/getWallet', { sub, chainId });
            if (!this.wallet.address) {
                return Promise.reject(`sub: ${sub} chainId: ${chainId} withdrawals pending`);
            } else {
                return Promise.resolve();
            }
        };
        return poll({ taskFn, interval: 3000, retries: 10 });
    }

    async claimReward() {
        try {
            this.isLoading = true;
            this.statusText = 'Processing your claim URL...';

            this.claimedReward = await this.$store.dispatch('assetpools/claimReward', this.state.claimUuid);
            if (!this.claimedReward) return;

            this.startConfetti();

            if (this.claim && this.claim.erc721) {
                await this.$store.dispatch('network/connect', this.claim.erc721.chainId);

                this.$store.commit('erc721/set', this.claim.erc721);

                const imgUrl = this.firstImageURL(this.claim.metadata);
                this.imgUrl = imgUrl ? imgUrl : this.defaultImgUrl;
            } else if (this.claim && this.claim.erc20) {
                await this.$store.dispatch('network/connect', this.claim.erc20.chainId);
            }
            this.isClaimFailed = false;
            this.isClaimInvalid = false;
        } catch (e) {
            const { error } = e as { error: { message: string } };
            if (error && error.message) {
                this.isClaimInvalid = true;
                this.error = error.message;
            } else {
                this.isClaimFailed = true;
            }
        } finally {
            this.isLoading = false;
        }
    }

    firstImageURL(metadata: TERC721Metadata) {
        let url = '';
        this.claim?.erc721.properties.forEach((p) => {
            if (p.propType === 'image') {
                const prop = metadata.attributes.find((a: { value: string; key: string }) => a.key === p.name);
                url = prop?.value as string;
            }
        });
        return url;
    }

    startConfetti() {
        this.$confetti.start({
            defaultDropRate: 7,
            particlesPerFrame: 1,
            windSpeedMax: 3,
            defaultSize: 7,
        });
    }

    goToWallet() {
        this.$confetti.stop();
        const path = this.claim?.erc721 ? 'nft' : 'coins';
        this.$router.push({ path });
    }

    connect() {
        if (!this.user.state) return;
        this.$store.dispatch('account/connectRedirect', {
            platform: this.reward?.platform,
            path: `/claim/${this.state.claimUuid}`,
        });
    }
}
</script>
<style scoped>
.img-treasure {
    background-size: contain;
    background-repeat: no-repeat;
    min-height: 250px;
    background-position: center center;
}
</style>
