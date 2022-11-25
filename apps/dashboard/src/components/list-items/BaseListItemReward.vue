<template>
    <base-card>
        <template #card-header>
            {{ reward.title }}
        </template>
        <template #card-footer>
            <b-progress style="border-radius: 0 0 0.3rem 0.3rem">
                <b-progress-bar
                    :label="reward.rewardLimit ? `${reward.progress}/${reward.rewardLimit}` : String(reward.progress)"
                    :value="reward.progress"
                    :min="0"
                    :max="reward.rewardLimit || reward.progress"
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
                <h3 class="text-primary">{{ reward.amount }} {{ pool.erc20.symbol }}</h3>
                <b-dropdown size="sm" variant="white" no-caret right>
                    <template #button-content>
                        <i
                            class="fas fa-ellipsis-v m-0 p-1 px-2 text-muted"
                            style="font-size: 1.2rem"
                            aria-hidden="true"
                        ></i>
                    </template>
                    <b-dropdown-item @click="onEdit()"> <i class="fas fa-pen mr-2"></i> Edit reward </b-dropdown-item>
                    <b-dropdown-item v-clipboard:copy="reward.uuid">
                        <i class="fas fa-clipboard mr-3"></i>Copy ID
                    </b-dropdown-item>
                    <b-dropdown-item-button v-if="Number(reward.claimAmount) > 1" @click="getQRCodes()">
                        <i class="fas fa-qrcode mr-3"></i>Download {{ reward.amount }} QR codes
                    </b-dropdown-item-button>
                    <b-dropdown-item v-if="Number(reward.claimAmount) === 1" @click="getQRCodes()">
                        <i class="fas fa-qrcode mr-3"></i>Download QR code
                    </b-dropdown-item>
                </b-dropdown>
            </div>
            <b-input-group size="sm" class="mt-2" v-if="Number(reward.claimAmount) === 1">
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
            </div>
        </template>
    </base-card>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { ChannelType, ChannelAction, RewardState } from '@thxnetwork/dashboard/types/rewards';
import type { Reward } from '@thxnetwork/dashboard/types/rewards';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseCard from '../cards/BaseCard.vue';
import VueQr from 'vue-qr';
import { BASE_URL, WALLET_URL } from '@thxnetwork/dashboard/utils/secrets';
import { mapGetters } from 'vuex';
import type { TBrandState } from '@thxnetwork/dashboard/store/modules/brands';
import type { TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { TBaseReward, TERC20Reward } from '@thxnetwork/types/index';

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

    @Prop() pool!: IPool;
    @Prop() reward!: TERC20Reward;
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

    mounted() {}

    async getQRCodes() {
        this.isDownloading = true;
        this.isDownloadScheduled = await this.$store.dispatch('rewards/getQRCodes', {
            reward: this.reward,
        });
        this.isDownloading = false;
    }
}
</script>
