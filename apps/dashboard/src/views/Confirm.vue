<template>
    <div class="h-100">
        <b-container class="m-auto h-100" fluid>
            <b-row class="h-100">
                <b-col md="6" class="h-100 d-flex align-items-center justify-content-center flex-column">
                    <div>
                        <b-img width="60" :src="require('@thxnetwork/dashboard/../public/assets/logo.png')" fluid />
                        <div>
                            <strong class="my-3 d-block font-weight-normal" :style="{ fontSize: '1.5rem' }">
                                E-mail confirmation
                            </strong>
                        </div>
                        <b-card>
                            <b-alert variant="primary" show>
                                <i class="fas fa-info-circle mr-2" />
                                {{ $route.query.message }}
                            </b-alert>
                            <b-button @click="onClickClose" block variant="primary">
                                Close Window
                                <i class="fas fa-times ml-2" />
                            </b-button>
                        </b-card>
                    </div>
                </b-col>
                <b-col
                    :style="{
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundImage: `url(${require('@thxnetwork/dashboard/../public/assets/bg.jpg')}) `,
                    }"
                >
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {},
    computed: {
        ...mapGetters({
            account: 'account/profile',
            pools: 'pools/all',
        }),
    },
})
export default class ViewDashboardConfirm extends Vue {
    isReady!: boolean;

    onClickClose() {
        window.close();
    }
}
</script>
