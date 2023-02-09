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
                    'background-image': `url(${require('../../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <div class="container container-md py-5">
                    <p class="brand-text">Commerce</p>
                    <b-button @click="onClickMerchantCreate" class="rounded-pill" variant="secondary">
                        <i class="fas fa-plus mr-2"></i>
                        <span class="mr-2">Create Merchant</span>
                    </b-button>
                </div>
            </b-jumbotron>
        </div>
        <div class="container container-md">//</div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import { mapGetters } from 'vuex';
// import ModalErc721Create from '@thxnetwork/dashboard/components/modals/BaseModalERC721Create.vue';

@Component({
    components: {
        // BaseModalMerchantCreate,
    },
})
export default class CommerceView extends Vue {
    mounted() {
        //
    }

    onClickMerchantCreate() {
        this.$store.dispatch('merchants/create');
    }
}
</script>
