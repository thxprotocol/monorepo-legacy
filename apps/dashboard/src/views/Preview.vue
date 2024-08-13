<template>
    <div class="bg-preview bg-dark w-100 h-100" :style="{ backgroundImage: `url(${backgroundImgUrl})` }">
        <b-img :src="logoImgUrl" class="logo-preview" />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { initWidget } from '@thxnetwork/dashboard/utils/widget';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import axios from 'axios';

@Component({
    computed: mapGetters({
        brands: 'brands/all',
    }),
})
export default class WidgetPreviewView extends Vue {
    logoImgUrl = '';
    backgroundImgUrl = '';

    async mounted() {
        const { data } = await axios.get(API_URL + '/v1/widget/' + this.$route.params.poolId);
        this.logoImgUrl = data.logoUrl ? data.logoUrl : this.logoImgUrl;
        this.backgroundImgUrl = data.backgroundUrl ? data.backgroundUrl : this.backgroundImgUrl;

        initWidget(this.$route.params.poolId);
    }
}
</script>
<style>
body {
    background-color: #212529;
}
#app {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    height: 100% !important;
}
</style>
<style scoped lang="scss">
.bg-preview {
    background-size: cover;
    background-position: center center;
    display: flex;
    align-items: center;
    justify-content: center;
}
.logo-preview {
    max-width: 20%;
    max-height: 20%;
}
</style>
