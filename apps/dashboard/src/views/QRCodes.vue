<template>
    <div>
        <div class="container-xl">
            <b-jumbotron
                class="mt-3 jumbotron-header"
                bg-variant="light"
                :style="{
                    'min-height': 'none',
                    'border-radius': '1rem',
                    'background-size': 'cover',
                    'background-image': `url(${require('@thxnetwork/dashboard/../../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <div class="container container-md py-5">
                    <p class="brand-text">QR Codes</p>
                    <b-button disabled class="rounded-pill mr-2" variant="secondary">
                        <i class="fas fa-plus mr-2"></i>
                        <span>Create QR Codes</span>
                    </b-button>
                    <b-button to="/nft" variant="link" class="text-light">
                        <i class="fas fa-palette mr-2"></i>
                        <span>Create NFT</span>
                    </b-button>
                </div>
            </b-jumbotron>
        </div>
        <div class="container container-md">
            <b-alert show variant="info">
                <i class="fas fa-info-circle mr-2" />
                Please contact us through the support chat if you require access to this feature.
            </b-alert>
            <base-nothing-here
                text-submit="Create QR Codes"
                title="You have not created any QR Codes yet"
                description="QR Codes are used to distribute NFT's on scale and in a user-friendly way."
            />
        </div>
        <modal-erc20-create />
        <modal-erc20-import />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';

@Component({
    components: {
        BaseNothingHere,
    },
})
export default class Tokens extends Vue {
    mounted() {
        this.$store.dispatch('account/getProfile');
    }
}
</script>
