<template>
    <div class="h-100" v-if="isReady">
        <b-container class="m-auto h-100" fluid>
            <b-row class="h-100">
                <b-col md="6" class="h-100 d-flex align-items-center justify-content-center flex-column">
                    <div>
                        <b-img width="60" :src="require('@thxnetwork/dashboard/../public/assets/logo.png')" fluid />
                        <div>
                            <strong class="my-3 d-block font-weight-normal" :style="{ fontSize: '1.5rem' }">
                                Sign in to dashboard
                            </strong>
                        </div>
                        <BaseCardLogin />
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
import { mapState } from 'vuex';
import BaseCardLogin from '@thxnetwork/dashboard/components/cards/BaseCardLogin.vue';

@Component({
    components: {
        BaseCardLogin,
    },
    computed: mapState('auth', {
        isReady: 'isReady',
    }),
})
export default class App extends Vue {
    isReady!: boolean;
}
</script>
