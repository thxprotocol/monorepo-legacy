<template>
    <b-modal
        id="modalShowWithdrawal"
        hide-header
        hide-header-close
        body-bg-variant="darker"
        body-text-variant="white"
        body-class="p-5"
        footer-bg-variant="darker"
        footer-border-variant="dark"
        no-close-on-backdrop
        no-close-on-esc
        size="lg"
        centered
    >
        <template v-if="withdrawal.rewardId">
            <div class="img-treasure" :style="`background-image: url(${imgUrl});`"></div>
            <h2 class="text-secondary text-center my-3">
                <strong>Congratulations!</strong> You've earned
                <strong>{{ withdrawal.amount }} {{ withdrawal.tokenSymbol }}</strong>
            </h2>
            <p class="lead text-center">
                Collect, swap or redeem these tokens for promotions.<br />
                <small class="text-muted" v-if="withdrawal.unlockDate">
                    Unlocks at {{ format(new Date(withdrawal.unlockDate), 'MMMM dd, yyyy') }}
                </small>
            </p>
        </template>

        <b-row v-if="withdrawal.erc721Id">
            <b-col xs="12" md="6" class="d-flex align-items-center">
                <b-img-lazy :src="imgUrl" class="d-block w-100" />
            </b-col>
            <b-col xs="12" md="6">
                <h2 class="text-secondary my-3">
                    <strong>Congratulations!</strong> You've earned NFT
                    <strong>#{{ withdrawal.tokenId }}</strong>
                </h2>
                <p class="lead">
                    {{ withdrawal.metadata.title }}<br />
                    <small class="text-muted">{{ withdrawal.metadata.description }}</small>
                </p>
            </b-col>
        </b-row>
        <template v-slot:modal-footer>
            <b-button class="rounded-pill" block variant="primary" @click="$emit('redirect')" type="submit">
                Continue
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { ERC721 } from '@thxnetwork/wallet/store/modules/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';

@Component({
    computed: mapGetters({ erc721s: 'erc721/all' }),
})
export default class BaseModalShowWithdrawal extends Vue {
    imgUrl = require('../../../public/assets/img/thx_treasure.png');
    erc721s!: { [id: string]: ERC721 };
    format = format;

    @Prop() withdrawal!: any;

    mounted() {
        if (this.withdrawal.erc721Id) {
            this.$store.dispatch('erc721/get', this.withdrawal.erc721Id).then(() => {
                const imgUrl = this.firstImageURL(this.withdrawal.metadata);
                if (imgUrl) this.imgUrl = imgUrl;
                this.$bvModal.show('modalShowWithdrawal');
            });
        } else {
            this.$bvModal.show('modalShowWithdrawal');
        }
    }

    get erc721() {
        return this.erc721s[this.withdrawal.erc721Id];
    }

    firstImageURL(metadata: any) {
        let url = '';
        this.erc721.properties.forEach(p => {
            if (p.propType === 'image') {
                url = metadata.attributes.find((a: { value: string; key: string }) => a.key === p.name).value;
            }
        });
        return url;
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
