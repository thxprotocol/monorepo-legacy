<template>
    <b-card
        bg-variant="darker"
        class="text-white mb-4 cursor-pointer"
        header-class="p-0"
        body-class="p-0"
        footer-class="justify-content-end d-flex px-3 py-2 pt-0"
        @click="goToCampaign"
    >
        <template #header>
            <div class="d-flex flex-column">
                <div class="card-header-bg" :style="{ backgroundImage: `url('${campaign.backgroundImgUrl}')` }"></div>
                <div class="card-header-content">
                    <b-img width="75" height="auto" class="rounded" :src="campaign.logoImgUrl" />
                    <div>
                        <b-badge :key="key" v-for="(tag, key) of campaign.tags" variant="darker" class="mr-1 p-2">
                            {{ tag }}
                        </b-badge>
                    </div>
                </div>
            </div>
        </template>
        <b-progress v-if="campaign.progress > 0" style="height: 10px; border-radius: 0">
            <b-progress-bar :value="campaign.progress" :max="100" variant="primary" />
        </b-progress>
        <div class="d-flex flex-column p-3">
            <div class="mb-2">
                <strong>
                    {{ campaign.title }}
                    <i
                        class="fas fa-check-circle"
                        :class="{ 'text-success': campaign.active, 'text-gray': !campaign.active }"
                    ></i>
                </strong>
            </div>
        </div>
        <template #footer>
            <div class="flex-grow-1">
                <b-badge variant="dark" class="mr-2 p-2">
                    <i class="fas fa-users mr-1"></i> {{ campaign.participants }}
                </b-badge>
                <b-badge variant="dark" class="mr-2 p-2">
                    <i class="fas fa-trophy mr-1"></i> {{ campaign.quests.length }}
                </b-badge>
                <b-badge variant="dark" class="mr-2 p-2">
                    <i class="fas fa-gift mr-1"></i> {{ campaign.rewards.length }}
                </b-badge>
                <b-badge
                    v-if="campaign.progress > 0"
                    variant="dark"
                    class="mr-2 p-2"
                    v-b-tooltip
                    :title="`Expires at ${format(new Date(campaign.expiryDate), 'dd-MM-yyyy HH:mm')}`"
                >
                    <i class="fas fa-clock mr-1"></i> {{ campaign.rewards.length }}
                </b-badge>
            </div>
            <b-button :href="campaign.domain" target="_blank" class="rounded-pill px-3" variant="dark" size="sm">
                <i class="fas fa-link ml-0 mr-2"></i>
                {{ origin }}
            </b-button>
        </template>
    </b-card>
</template>
<script lang="ts">
import { TCampaign } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import { WIDGET_URL } from '../config/secrets';

@Component({
    name: 'BaseCardCampaign',
    components: {},
})
export default class BaseCardCampaign extends Vue {
    format = format;
    open = window.open;

    @Prop() campaign!: TCampaign;

    get origin() {
        return new URL(this.campaign.domain).host;
    }

    goToCampaign() {
        window.open(`${WIDGET_URL}/${this.campaign._id}`, '_self');
    }
}
</script>
<style>
.card-header {
    overflow: hidden;
    position: relative;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.card-header-content {
    z-index: 1;
    text-align: center;
}
.card-header-bg {
    top: 0;
    left: 0;
    position: absolute;
    height: 100%;
    width: 100%;
    background-size: cover;
    z-index: 0;
    filter: blur(8px);
    -webkit-filter: blur(8px);

    * {
        filter: blur(0px);
        -webkit-filter: blur(0px);
    }
}
</style>
