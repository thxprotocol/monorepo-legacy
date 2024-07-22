<template>
    <section class="py-lg-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-6 order-1 order-lg-0 align-items-center d-flex">
                    <img
                        width="100%"
                        height="auto"
                        class="img-fluid"
                        :src="require('../../public/assets/img/ui-demo.png')"
                        alt=""
                    />
                </div>
                <div class="col-lg-5 col-xl-4 offset-xl-1 d-flex align-items-center py-5">
                    <div>
                        <h2 class="h5">Live Product Demo</h2>
                        <p class="lead">How will you be using THX Network?</p>
                        <p class="lead font-weight-light mb-4">
                            In the product demo we'll explore your intended use case and show exclusive product updates
                            that the team has been working on behind the scenes.
                        </p>
                        <b-button
                            variant="primary"
                            class="p-1 mb-3 mb-md-0 mb-lg-3 rounded-pill"
                            target="_blank"
                            :href="calendlyMieszko"
                        >
                            <img
                                width="50"
                                class="rounded-pill p-1 bg-white d-inline mr-2"
                                :src="require('../../public/assets/img/calendly-mieszko.png')"
                                alt=""
                            />
                            Schedule a demo with Mieszko
                            <i class="fas fa-chevron-right mr-3"></i>
                        </b-button>
                        <b-button variant="primary" class="p-1 rounded-pill" target="_blank" :href="calendlySteffen">
                            <img
                                width="50"
                                class="rounded-pill p-1 bg-white d-inline mr-2"
                                :src="require('../../public/assets/img/calendly-steffen.jpg')"
                                alt=""
                            />
                            Schedule a demo with Steffen
                            <i class="fas fa-chevron-right mr-3"></i>
                        </b-button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
const CALENDLY_STEFFEN = 'https://calendly.com/mieszko/demo';
const CALENDLY_MIESZKO = 'https://calendly.com/mieszko/demo';

@Component({
    components: {},
})
export default class BaseDemoDescription extends Vue {
    calendlySteffen = CALENDLY_STEFFEN;
    calendlyMieszko = CALENDLY_MIESZKO;
}
</script>
