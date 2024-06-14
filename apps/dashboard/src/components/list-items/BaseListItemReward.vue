<template>
    <base-card>
        <template #card-header>
            {{ reward.title }}
        </template>
        <template #card-footer v-if="!reward.erc721metadataId && reward.progress">
            <b-progress style="border-radius: 0 0 0.3rem 0.3rem">
                <b-progress-bar
                    :label="
                        reward.withdrawLimit ? `${reward.progress}/${reward.withdrawLimit}` : String(reward.progress)
                    "
                    :value="reward.progress"
                    :min="0"
                    :max="reward.withdrawLimit || reward.progress"
                />
            </b-progress>
        </template>
        <template #card-body>
            <b-alert variant="success" show v-if="isDownloadScheduled">
                <i class="fas fa-clock mr-2"></i>
                You will receive an e-mail when your download is ready!
            </b-alert>
            <b-alert variant="info" show v-if="isDownloading">
                <i class="fas fa-hourglass-half mr-2"></i>
                Downloading your QR codes
            </b-alert>
            <div class="d-flex align-items-center">
                <h3 v-if="!reward.erc721metadataId" class="text-primary">
                    {{ reward.withdrawAmount }} {{ pool.erc20.symbol }}
                </h3>
                <h3 v-if="reward.erc721metadataId" class="text-primary">1 {{ pool.erc721.symbol }}</h3>
                <b-badge v-if="reward.erc721metadataId" variant="dark" class="mb-2 mx-2">NFT</b-badge>
                <sup
                    class="fas fa-circle ml-1 mr-auto"
                    :class="{
                        'text-danger': !reward.state,
                        'text-success': reward.state,
                    }"
                    style="font-size: 0.8rem"
                >
                </sup>
                <b-dropdown size="sm" variant="white" no-caret right>
                    <template #button-content>
                        <i
                            class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted"
                            style="font-size: 1.2rem"
                            aria-hidden="true"
                        ></i>
                    </template>
                    <b-dropdown-item @click="onEdit()"> <i class="fas fa-pen mr-2"></i> Edit reward </b-dropdown-item>
                    <b-dropdown-item v-clipboard:copy="reward.id">
                        <i class="fas fa-clipboard mr-3"></i>Copy ID
                    </b-dropdown-item>
                    <b-dropdown-item-button v-if="reward.amount > 1" @click="getQRCodes()">
                        <i class="fas fa-qrcode mr-3"></i>Download {{ reward.amount }} QR codes
                    </b-dropdown-item-button>
                    <b-dropdown-item v-if="reward.amount === 1" @click="getQRCodes()">
                        <i class="fas fa-qrcode mr-3"></i>Download QR code
                    </b-dropdown-item>
                    <b-dropdown-item @click="toggleState()">
                        <i class="fas fa-power-off mr-3"></i>{{ reward.state ? 'Disable' : 'Enable' }}
                    </b-dropdown-item>
                    <b-dropdown-item @click="remove()"> <i class="fas fa-trash mr-3"></i>Delete </b-dropdown-item>
                </b-dropdown>
            </div>
            <b-input-group size="sm" class="mt-2" v-if="reward.amount === 1">
                <b-form-input size="sm" readonly :value="claimURL" />
                <b-input-group-append>
                    <b-button variant="primary" v-clipboard:copy="claimURL">
                        <i class="fas fa-clipboard m-0" style="font-size: 1rem"></i>
                    </b-button>
                </b-input-group-append>
            </b-input-group>
            <hr />
            <div>
                <b-badge
                    v-b-tooltip
                    title="Amount of times the user is able to claim this reward per account."
                    class="border p-2 mb-1 mr-1"
                    variant="light"
                >
                    {{ reward.isClaimOnce ? 'Claim once' : 'Claim unlimited' }}
                </b-badge>

                <b-badge
                    v-b-tooltip
                    title="Verifies that the user claiming the reward has a membership for the pool."
                    class="border p-2 mb-1 mr-1"
                    v-if="reward.isMembershipRequired"
                    variant="light"
                >
                    Members only
                </b-badge>
                <b-link
                    v-if="channelItemURL"
                    v-b-tooltip
                    title="Verifies that the user has engaged with a given item in a social channel."
                    target="_blank"
                    :href="channelItemURL"
                >
                    <b-badge class="border p-2 mb-1 mr-1" variant="light">
                        <img
                            v-if="channelType"
                            height="10"
                            class="mr-1"
                            :src="require(`../../../public/assets/logo-${channelType.toLowerCase()}.png`)"
                            alt=""
                        />
                        {{ channelAction }}
                    </b-badge>
                </b-link>
                <b-badge
                    v-b-tooltip
                    v-if="reward.expiryDate"
                    class="border p-2 mb-1 mr-1 font-weight-normal"
                    title="Until this date and time the reward could be claimed.'"
                    variant="light"
                >
                    <strong>Expiry:</strong>
                    {{ new Date(reward.expiryDate).toLocaleString() }}
                </b-badge>
                <b-badge
                    v-b-tooltip
                    title="This reward could be claimed, but only withdrawn after this date."
                    v-if="reward.withdrawUnlockDate"
                    class="border p-2 mb-1 mr-1 font-weight-normal"
                    variant="light"
                >
                    <strong>Unlocked:</strong>
                    {{ new Date(reward.withdrawUnlockDate).toLocaleString() }}
                </b-badge>
            </div>
        </template>
    </base-card>
</template>

<script lang="ts">
import type { TPool } from '@thxnetwork/dashboard/store/modules/pools';
import { ChannelType, ChannelAction, RewardState } from '@thxnetwork/dashboard/types/rewards';
import type { Reward } from '@thxnetwork/dashboard/types/rewards';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseCard from '../cards/BaseCard.vue';
import VueQr from 'vue-qr';
import { BASE_URL, WALLET_URL } from '@thxnetwork/dashboard/config/secrets';
import { mapGetters } from 'vuex';
import type { TBrandState } from '@thxnetwork/dashboard/store/modules/brands';
import type { TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';

const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = url;
    });
};

@Component({
    computed: mapGetters({
        brands: 'brands/all',
    }),
    components: {
        BaseCard,
        VueQr,
    },
})
export default class BaseCardReward extends Vue {
    channelType = '';
    channelAction = '';
    channelItemURL = '';
    imgData = '';
    claimURL = '';
    qrURL = '';
    isDownloading = false;
    isDownloadScheduled = false;

    @Prop() pool!: TPool;
    @Prop() reward!: Reward;
    @Prop() erc721!: TERC721;

    brands!: TBrandState;

    get brand() {
        return this.brands[this.pool._id];
    }

    get filteredMetadata() {
        return this.erc721 && this.erc721.metadata && this.erc721.metadata.filter((m: TERC721Metadata) => !m.tokenId);
    }

    get expired() {
        if (!this.reward.expiryDate) return false;
        const currentTime = new Date().getTime();
        const expiryTime = new Date(this.reward.expiryDate).getTime();
        return currentTime < expiryTime;
    }

    mounted() {
        if (this.reward.withdrawCondition) {
            this.channelType = ChannelType[this.reward.withdrawCondition.channelType];
            this.channelAction = ChannelAction[this.reward.withdrawCondition.channelAction];
            this.channelItemURL = this.getChannelActionURL(
                this.reward.withdrawCondition.channelAction,
                this.reward.withdrawCondition.channelItem,
            );
        }
        if (this.reward.amount == 1) {
            this.$store.dispatch('brands/getForPool', this.pool._id).then(() => {
                const logoImgUrl = this.brand
                    ? this.brand.logoImgUrl
                    : BASE_URL + require('@thxnetwork/dashboard/../public/assets/qr-logo.jpg');
                this.claimURL = `${WALLET_URL}/claim/${this.reward.claims[0].uuid}`;
                getBase64Image(logoImgUrl).then((data) => {
                    this.imgData = data;
                });
            });
        }
    }

    onQRLoaded(dataUrl: string) {
        this.qrURL = dataUrl;
    }

    onEdit() {
        this.$emit('edit', this.reward);
    }

    getChannelActionURL(channelAction: ChannelAction, channelItem: string) {
        switch (channelAction) {
            case ChannelAction.YouTubeLike:
                return `https://youtu.be/${channelItem}`;
            case ChannelAction.YouTubeSubscribe:
                return `https://youtube.com/channel/${channelItem}`;
            case ChannelAction.TwitterRetweet:
                return `https://www.twitter.com/twitter/status/${channelItem}`;
            case ChannelAction.TwitterFollow:
                return `https://www.twitter.com/i/user/${channelItem}`;
            default:
                return '';
        }
    }

    toggleState() {
        this.$store.dispatch('rewards/update', {
            pool: this.pool,
            reward: {
                ...this.reward,
                state: this.reward.state ? RewardState.Disabled : RewardState.Enabled,
            },
        });
    }

    async getQRCodes() {
        this.isDownloading = true;
        this.isDownloadScheduled = await this.$store.dispatch('rewards/getQRCodes', {
            reward: this.reward,
        });
        this.isDownloading = false;
    }

    async remove() {
        await this.$store.dispatch('rewards/delete', {
            reward: this.reward,
        });
        this.$emit('delete');
    }
}
</script>
