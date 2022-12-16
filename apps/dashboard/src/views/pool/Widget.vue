<template>
    <div>
        <b-row class="mb-3">
            <h2 class="mb-0 mr-2">Loyalty Widget</h2>
        </b-row>
        <BCard variant="white" body-class="shadow-sm">
            <strong>Embed code</strong>
            <p class="text-muted">
                Place this code before the closing body tag of your HTML page. The launcher will appear and showcase
                your loyalty program to your web audience.
            </p>
            <pre class="rounded text-white p-3 d-flex align-items-center bg-dark" style="white-space: nowrap">
                <b-button 
                    variant="light" 
                    v-clipboard:copy="code"
                    v-clipboard:success="() => isCopied = true" size="sm" class="mr-3">
                    <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                </b-button>
                <code class="language-html" v-html="codeExample"></code>
            </pre>
            <strong>Color scheme</strong>
            <p class="text-muted">Choose a color scheme for the widget launcher.</p>
            <b-row>
                <b-col md="6">
                    <b-form-group label="Background color">
                        <b-input style="width: 100px" size="sm" type="color" v-model="bgColor" />
                    </b-form-group>
                    <b-form-group label="Color">
                        <b-input style="width: 100px" size="sm" type="color" v-model="color" /><br />
                    </b-form-group>
                </b-col>
                <b-col md="6">
                    <BCard body-class="bg-light p-5 d-flex justify-content-center">
                        <div class="widget-launcher" :style="`background-color: ${bgColor}`">
                            <div class="widget-notifications">3</div>
                            <svg
                                id="thx-svg-gift"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                :style="`fill: ${color}`"
                            >
                                <path
                                    d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"
                                />
                            </svg>
                        </div>
                    </BCard>
                </b-col>
            </b-row>
            <hr />
            <div class="d-flex justify-content-end">
                <BButton variant="primary" class="rounded-pill" @click="onClickUpdate"> Update </BButton>
            </div>
        </BCard>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import BaseModalWidgetCreate from '@thxnetwork/dashboard/components/modals/BaseModalWidgetCreate.vue';
import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('xml', XML);

@Component({
    components: {
        BaseModalWidgetCreate,
    },
    computed: mapGetters({
        pools: 'pools/all',
        rewards: 'rewards/all',
        widgets: 'widgets/all',
    }),
})
export default class WidgetsView extends Vue {
    pools!: IPools;
    isCopied = false;
    bgColor = '#5942c1';
    color = '#FFFFFF';
    isSubmitting = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get code() {
        return `<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`;
    }

    get codeExample() {
        return hljs.highlight(`<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`, {
            language: 'xml',
        }).value;
    }

    async onClickUpdate() {
        this.isSubmitting = true;
        await this.$store.dispatch('widgets/create', {
            poolId: this.pool._id,
            color: this.color,
            bgColor: this.bgColor,
        });
        this.isSubmitting = false;
    }
}
</script>
<style lang="scss">
#thx-svg-gift {
    display: block;
    margin: auto;
    fill: white;
    width: 20px;
    height: 20px;
    transform: scale(1);
    transition: transform 0.2s ease;
}
.widget-launcher {
    display: flex;
    width: 60px;
    height: 60px;
    background-color: #5942c1;
    border-radius: 50%;
    cursor: pointer;
}
.widget-notifications {
    display: flex;
    font-family: Arial;
    font-size: 13px;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    color: #ffffff;
    position: absolute;
    background-color: #ca0000;
    border-radius: 50%;
    user-select: none;
}
</style>
