<template>
    <div>
        <h2 class="mb-3">Loyalty Widget</h2>
        <BCard variant="white" body-class="shadow-sm">
            <strong>Embed code</strong>
            <p class="text-muted">
                Place this code before the closing body tag of your HTML page. The launcher will show for your web page
                visitors.
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
            <b-alert show variant="info" class="d-flex justify-content-between">
                <div>
                    <i class="fas fa-info-circle mr-2"></i>
                    Get our SDK on NPM and construct the THXWidget class in your SPA.
                </div>
                <b-link target="_blank" href="https://www.npmjs.com/package/@thxnetwork/sdk">
                    Read more
                    <i class="fas fa-chevron-right ml-2"></i>
                </b-link>
            </b-alert>
            <hr />
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
            <strong>Default theme</strong>
            <p class="text-muted">Choose the default theme for widget frame when opened.</p>
            <b-row>
                <b-col md="6">
                    <b-form-group>
                        <b-form-radio v-model="theme" name="themes" value="light"> Light </b-form-radio>
                        <b-form-radio v-model="theme" name="themes" value="dark"> Dark </b-form-radio>
                    </b-form-group>
                </b-col>
                <b-col md="6" class="d-flex justify-content-between">
                    <img
                        width="200"
                        :style="{ opacity: theme === 'light' ? 1 : 0.5 }"
                        :src="require('@thxnetwork/dashboard/../public/assets/theme-light.png')"
                        alt="Light theme"
                    />
                    <img
                        width="200"
                        :style="{ opacity: theme === 'dark' ? 1 : 0.5 }"
                        :src="require('@thxnetwork/dashboard/../public/assets/theme-dark.png')"
                        alt="Dark theme"
                    />
                </b-col>
            </b-row>
            <hr />
            <div class="d-flex justify-content-end">
                <b-button variant="link" @click="onClickPreview"> Preview </b-button>
                <BButton
                    :disabled="!widget || isSubmitting"
                    variant="primary"
                    class="rounded-pill"
                    @click="onClickUpdate"
                >
                    Update
                </BButton>
            </div>
        </BCard>
    </div>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import { IWidgets } from '@thxnetwork/dashboard/store/modules/widgets';
import BaseModalWidgetCreate from '@thxnetwork/dashboard/components/modals/BaseModalWidgetCreate.vue';
import { BASE_URL } from '@thxnetwork/dashboard/utils/secrets';

hljs.registerLanguage('xml', XML);

@Component({
    components: {
        BaseModalWidgetCreate,
    },
    computed: mapGetters({
        pools: 'pools/all',
        widgets: 'widgets/all',
    }),
})
export default class WidgetsView extends Vue {
    pools!: IPools;
    widgets!: IWidgets;
    isCopied = false;
    bgColor = '#5942c1';
    color = '#FFFFFF';
    theme = 'light';
    isSubmitting = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get widget() {
        if (!this.widgets[this.$route.params.id]) return;
        return Object.values(this.widgets[this.$route.params.id])[0];
    }

    get code() {
        return `<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`;
    }

    get codeExample() {
        return hljs.highlight(`<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`, {
            language: 'xml',
        }).value;
    }

    mounted() {
        this.$store.dispatch('widgets/list', this.pool).then(async () => {
            if (!this.widget) {
                await this.$store.dispatch('widgets/create', {
                    poolId: this.pool._id,
                    color: this.color,
                    bgColor: this.bgColor,
                    theme: this.theme,
                });
            } else {
                this.color = this.widget.color;
                this.bgColor = this.widget.bgColor;
                this.theme = this.widget.theme;
            }
        });
    }

    onClickPreview() {
        window.open(`${BASE_URL}/preview/${this.pool._id}`, '_blank');
    }

    async onClickUpdate() {
        if (!this.widget) return;

        this.isSubmitting = true;
        await this.$store.dispatch('widgets/update', {
            poolId: this.pool._id,
            uuid: this.widget.uuid,
            color: this.color,
            bgColor: this.bgColor,
            theme: this.theme,
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
