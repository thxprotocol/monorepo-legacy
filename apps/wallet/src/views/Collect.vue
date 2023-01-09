<template>
    <div class="d-flex align-items-center justify-content-center bg-dark p-5">
        <div class="flex-row text-white">
            <div v-if="isLoading && !error" class="text-center">
                <b-spinner variant="secondary" large /><br />
                <span class="text-muted mt-2">Claiming your reward...</span>
            </div>
            <template v-else>
                <template v-if="isClaimInvalid">
                    <b-alert show variant="info">
                        <i class="fas fa-info-circle mr-2"></i>
                        {{ error }}
                    </b-alert>
                    <b-button block variant="primary" class="rounded-pill" to="/tokens"> Continue </b-button>
                </template>
                <template v-if="isClaimFailed">
                    <b-alert show variant="danger">
                        Oops, we did not manage to claim your token reward at this time, please visit your claim URL or
                        scan your QR code again.
                    </b-alert>
                </template>
            </template>

            <template v-if="!isLoading && claimedReward">
                <template v-if="claimedReward.erc20">
                    <div class="img-treasure" :style="`background-image: url(${imgUrl});`"></div>
                    <h2 class="text-secondary text-center my-3">
                        <strong>Congratulations!</strong> You have earned
                        <strong>{{ claimedReward.withdrawal.amount }} {{ claimedReward.erc20.symbol }}</strong>
                    </h2>
                    <p class="lead text-center">Collect, swap or redeem these tokens for promotions.<br /></p>
                </template>
                <b-row v-if="claimedReward.erc721">
                    <b-col xs="12" md="6" class="d-flex align-items-center">
                        <b-img-lazy :src="imgUrl" class="d-block w-100" />
                    </b-col>
                    <b-col xs="12" md="6">
                        <h2 class="text-secondary my-3"><strong>Congratulations!</strong> You've claimed an NFT.</h2>
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
                [RewardConditionPlatform.Google, RewardConditionPlatform.Twitter].includes(reward.platform) &&
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
            <hr />
            <b-alert varian="info" show>
                We will use your social account to verify if you
                <b-link v-if="reward.itemUrl" target="_blank" :href="reward.itemUrl.href" class="font-weight-bold">
                    {{ reward.itemUrl.label }}
                </b-link>
            </b-alert>
            <p class="text-muted">Please, connect to this channel to claim your reward.</p>
            <b-button @click="connect" variant="primary" block class="rounded-pill"> Connect </b-button>
        </b-card>
    </div>
</template>

<script lang="ts">
import { ERC721, TERC721Metadata, TERC721Token } from '@thxnetwork/wallet/store/modules/erc721';
import { Withdrawal, WithdrawalState } from '@thxnetwork/wallet/store/modules/withdrawals';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { User } from 'oidc-client-ts';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import poll from 'promise-poller';
import { UserProfile } from '../store/modules/account';
import { RewardConditionInteraction, RewardConditionPlatform, TERC20Perk, TERC721Perk } from '@thxnetwork/types/index';
import { TERC20 } from '../store/modules/erc20';

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
        }),
    },
})
export default class Collect extends Vue {
    format = format;
    imgUrl = require('@thxnetwork/wallet/../public/assets/img/thx_treasure.png');
    error = '';
    isLoading = true;
    claimStarted = false;
    isClaimFailed = false;
    isClaimInvalid = false;
    claim: TClaim | null = null;
    claimedReward: (TClaim & { withdrawal: Withdrawal; token: TERC721Token }) | null = null;
    state!: { claimUuid: string; rewardHash: string };

    erc721s!: { [id: string]: ERC721 };
    user!: User;

    reward:
        | null
        | (TERC20Perk & { itemUrl: { href: string; label: string } })
        | (TERC721Perk & { itemUrl: { href: string; label: string } }) = null;
    profile!: UserProfile;
    hasValidAccessToken = false;
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    currentChannel: RewardConditionPlatform | null = null;

    get erc721() {
        if (!this.claim) return null;
        return this.erc721s[this.claim.erc721._id];
    }

    async mounted() {
        if (!this.user || !this.user.state) {
            this.$router.push({ path: 'memberships' });
        }

        // Store state locally to solve type issues
        this.state = this.user.state as { claimUuid: string; rewardHash: string };

        // Get claim information based on url claimUuid or rewardHash. rewardHash will be deprecated
        this.claim = await this.$store.dispatch('assetpools/getClaim', this.state.claimUuid);
        if (!this.claim) return;
        this.reward = this.claim.reward;

        // If no condition applies claim directly
        if (!this.claim.reward.platform) {
            return await this.claimReward();
        }

        // Check validity of current access token
        switch (this.claim.reward.platform) {
            case RewardConditionPlatform.Google:
                this.hasValidAccessToken = this.profile.googleAccess;
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

    async claimReward() {
        try {
            this.isLoading = true;
            this.claimedReward = await this.$store.dispatch('assetpools/claimReward', this.state.claimUuid);
            if (!this.claimedReward) return;

            if (this.claimedReward?.erc20) {
                await this.waitForWithdrawn(this.claimedReward.withdrawal);
            } else {
                await this.waitForMinted(this.claimedReward.token);
            }

            this.startConfetti();

            if (this.claim && this.claim.erc721) {
                await this.$store.dispatch('network/connect', this.claim.erc721.chainId);
                this.$store.commit('erc721/set', this.claim.erc721);
                const imgUrl = this.firstImageURL(this.claim.metadata);
                if (imgUrl) this.imgUrl = imgUrl;
            } else if (this.claim && this.claim.erc20) {
                await this.$store.dispatch('network/connect', this.claim.erc20.chainId);
            }
        } catch (e) {
            const res = (e as AxiosError).response;
            this.isClaimFailed = res?.status === 500;
            this.isClaimInvalid = res?.status === 403;
            if (res?.status === 403) {
                this.error = res?.data.error.message;
            }
        } finally {
            this.isLoading = false;
        }
    }

    async waitForWithdrawn(withdrawal: Withdrawal) {
        const taskFn = async () => {
            if (!this.reward) return;
            const w = await this.$store.dispatch('withdrawals/get', {
                id: withdrawal._id,
                poolId: this.reward.poolId,
            });
            if (w && w.state === WithdrawalState.Withdrawn) {
                return Promise.resolve(w);
            } else {
                return Promise.reject(w);
            }
        };

        return poll({ taskFn, interval: 3000, retries: 10 });
    }

    async waitForMinted(token: TERC721Token) {
        const taskFn = async () => {
            const t = await this.$store.dispatch('erc721/getToken', token._id);
            if (t && t.state !== 0) {
                return Promise.resolve(t);
            } else {
                return Promise.reject(t);
            }
        };

        return poll({ taskFn, interval: 3000, retries: 10 });
    }

    firstImageURL(metadata: TERC721Metadata) {
        let url = '';
        this.claim?.erc721.properties.forEach((p) => {
            if (p.propType === 'image') {
                const prop = metadata.attributes.find((a: { value: string; key: string }) => a.key === p.name);
                url = prop?.value;
            }
        });
        return url;
    }

    startConfetti() {
        (this as any).$confetti.start({
            defaultDropRate: 7,
            particlesPerFrame: 1,
            windSpeedMax: 3,
            defaultSize: 7,
        });
    }

    goToWallet() {
        (this as any).$confetti.stop();
        const path = this.claim?.erc721 ? 'collectibles' : 'tokens';
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
