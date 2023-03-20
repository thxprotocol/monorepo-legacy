<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Embed code</strong>
                <p class="text-muted">
                    Place this code before the closing body tag of your HTML page. The launcher will show for your web
                    page visitors.<br />
                    <b-link target="_blank" href="https://www.npmjs.com/package/@thxnetwork/sdk"> Download SDK </b-link>
                </p>
            </b-col>
            <b-col md="8">
                <pre class="rounded text-white p-3 d-flex align-items-center bg-dark" style="white-space: nowrap">
                    <b-button 
                        variant="light" 
                        v-clipboard:copy="code"
                        v-clipboard:success="() => isCopied = true" size="sm" class="mr-3">
                        <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                    </b-button>
                    <code class="language-html" v-html="codeExample"></code>
                </pre>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Theme</strong>
                <p class="text-muted">Customize the color scheme of your widget.</p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="3">
                        <div class="d-flex">
                            <strong>Elements</strong>
                            <b-button class="ml-auto" variant="light" size="sm" @click="onClickResetElements">
                                <i class="fas fa-undo ml-0"></i>
                            </b-button>
                        </div>
                        <hr />
                        <b-form-group
                            :label="el.label"
                            :key="key"
                            v-for="(el, key) in elements"
                            label-cols="8"
                            label-size="sm"
                        >
                            <b-form-input size="sm" type="color" v-model="el.color" />
                        </b-form-group>
                    </b-col>
                    <b-col md="3">
                        <div class="d-flex">
                            <strong>Colors</strong>
                            <b-button class="ml-auto" variant="light" size="sm" @click="onClickResetColors">
                                <i class="fas fa-undo ml-0"></i>
                            </b-button>
                        </div>
                        <hr />
                        <b-form-group
                            :label="el.label"
                            :key="key"
                            v-for="(el, key) in colors"
                            label-cols="8"
                            label-size="sm"
                        >
                            <b-form-input size="sm" type="color" v-model="el.color" />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BCard
                            class="h-100"
                            body-class="bg-light p-3 d-flex justify-content-center h-100 flex-column align-items-end"
                            id="widget-iframe-preview"
                        >
                            <div
                                class="widget-iframe"
                                :style="`background-color: ${elements.bodyBg.color}; color: ${elements.text.color}; `"
                            >
                                <div style="padding: 0.5rem">
                                    <div class="card" :style="`background-color: ${elements.cardBg.color};`">
                                        <div class="card-header">
                                            <div class="card-title mb-0 d-flex justify-content-between">
                                                Daily Reward
                                                <strong class="ml-auto" :style="`color: ${colors.success.color}`">
                                                    15
                                                </strong>
                                            </div>
                                        </div>
                                        <div class="card-body">
                                            <BaseWidgetAlertPreview
                                                icon="fas fa-gift"
                                                text="Congratulations! You have received an NFT."
                                                :color="colors.success.color"
                                                :lighten="1.25"
                                                :darken="0.5"
                                            />
                                            <BaseWidgetAlertPreview
                                                icon="fas fa-exclamation-triangle"
                                                text="Twitter: You are not following the account."
                                                :color="colors.danger.color"
                                                :lighten="0.7"
                                                :darken="0.5"
                                            />
                                            <BaseWidgetAlertPreview
                                                icon="fas fa-exclamation-circle"
                                                text="You will not be able to change this later."
                                                :color="colors.warning.color"
                                                :lighten="0.85"
                                                :darken="0.4"
                                            />
                                            <BaseWidgetAlertPreview
                                                icon="fas fa-info-circle"
                                                text="We cover the gas costs for this transfer."
                                                :color="colors.info.color"
                                                :lighten="1.25"
                                                :darken="0.5"
                                            />
                                            <p style="opacity: 0.65">
                                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                            </p>
                                            <b-button
                                                variant="primary"
                                                class="rounded-pill"
                                                block
                                                :style="`background-color: ${elements.btnBg.color};color: ${elements.btnText.color};`"
                                            >
                                                Claim <strong>15 points</strong>
                                            </b-button>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="navbar navbar-bottom"
                                    :style="`background-color: ${elements.navbarBg.color}`"
                                >
                                    <b-button
                                        variant="primary"
                                        class="text-center"
                                        :style="`background-color: ${elements.btnBg.color}; color: ${elements.btnText.color};`"
                                    >
                                        <i class="fas fa-trophy m-0" style="font-size: 1.3rem"></i><br />Earn
                                    </b-button>
                                    <b-button variant="link" class="text-center">
                                        <i class="fas fa-store m-0" style="font-size: 1.3rem"></i><br />Shop
                                    </b-button>
                                    <b-button variant="link" class="text-center">
                                        <i class="fas fa-wallet m-0" style="font-size: 1.3rem"></i><br />Wallet
                                    </b-button>
                                </div>
                            </div>
                            <div
                                class="widget-launcher ml-auto mt-3"
                                :style="`background-color: ${elements.launcherBg.color}`"
                            >
                                <div class="widget-notifications">3</div>
                                <svg
                                    id="thx-svg-gift"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    :style="`fill: ${elements.launcherIcon.color}`"
                                >
                                    <path
                                        d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"
                                    />
                                </svg>
                            </div>
                        </BCard>
                    </b-col>
                </b-form-row>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Launcher</strong>
                <p class="text-muted">
                    This launcher will show in the bottom left or right corner for pages with the widget embed code.
                </p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="6">
                        <b-form-group :description="`${message ? message.length : 0}/280`" label="Message">
                            <b-textarea
                                v-model="message"
                                placeholder="Hi there! Click me to earn rewards and redeem crypto perks."
                            >
                            </b-textarea>
                        </b-form-group>
                        <hr />
                        <b-form-group label="Alignment">
                            <b-form-radio v-model="align" name="align" value="left"> Left </b-form-radio>
                            <b-form-radio v-model="align" name="align" value="right"> Right </b-form-radio>
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BCard
                            class="h-100"
                            :body-class="
                                align === 'right'
                                    ? 'align-items-end bg-light p-3 d-flex justify-content-center h-100 flex-column'
                                    : 'align-items-start bg-light p-3 d-flex justify-content-center h-100 flex-column'
                            "
                            id="widget-iframe-preview"
                        >
                            <div class="widget-message" v-if="message.length">
                                <div
                                    class="widget-message-logo"
                                    :style="`background-image: url(${pool.brand ? pool.brand.logoImgUrl : ''});`"
                                ></div>
                                <span style="z-index: 0">{{ message }}</span
                                ><button class="widget-message-close">×</button>
                            </div>
                            <div class="widget-launcher mt-3" :style="`background-color: ${elements.launcherBg.color}`">
                                <div class="widget-notifications">3</div>
                                <svg
                                    id="thx-svg-gift"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    :style="`fill: ${elements.launcherIcon.color}`"
                                >
                                    <path
                                        d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"
                                    />
                                </svg>
                            </div>
                        </BCard>
                    </b-col>
                </b-form-row>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Origin</strong>
                <p class="text-muted">Configure the domain the widget will be loaded on.</p>
            </b-col>
            <b-col md="8">
                <b-form-group>
                    <b-form-input v-model="domain" />
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
        <div class="d-flex justify-content-center">
            <b-button variant="link" @click="onClickPreview"> Preview </b-button>
            <BButton :disabled="!widget || isSubmitting" variant="primary" class="rounded-pill" @click="onClickUpdate">
                Update
            </BButton>
        </div>
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
import BaseWidgetAlertPreview from '@thxnetwork/dashboard/components/widget/BaseWidgetAlertPreview.vue';
import { BASE_URL } from '@thxnetwork/dashboard/utils/secrets';
import Color from 'color';
import { DEFAULT_ELEMENTS, DEFAULT_COLORS } from '@thxnetwork/types/contants';

hljs.registerLanguage('xml', XML);

@Component({
    components: {
        BaseModalWidgetCreate,
        BaseWidgetAlertPreview,
    },
    computed: mapGetters({
        pools: 'pools/all',
        widgets: 'widgets/all',
    }),
})
export default class WidgetsView extends Vue {
    DEFAULT_ELEMENTS = DEFAULT_ELEMENTS;
    DEFAULT_COLORS = DEFAULT_COLORS;
    pools!: IPools;
    widgets!: IWidgets;
    Color = Color;
    isCopied = false;
    message = '';
    align = 'left';
    bgColor = '#5942c1';
    color = '#FFFFFF';
    domain = '';
    isSubmitting = false;
    elements = DEFAULT_ELEMENTS;
    colors = DEFAULT_COLORS;

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
            if (!this.widget) return;

            this.align = this.widget.align;
            this.message = this.widget.message;
            this.domain = this.widget.domain;
            this.color = this.widget.color;
            this.bgColor = this.widget.bgColor;

            const { elements, colors } = JSON.parse(this.widget.theme);
            for (const key in this.elements) {
                this.elements[key] = elements[key] ? elements[key] : this.elements[key];
            }
            for (const key in this.colors) {
                this.colors[key] = colors[key] ? colors[key] : this.colors[key];
            }
        });
    }

    onClickResetColors() {
        for (const key in DEFAULT_COLORS) {
            this.colors[key] = DEFAULT_COLORS[key];
        }
    }

    onClickResetElements() {
        for (const key in DEFAULT_ELEMENTS) {
            this.elements[key] = DEFAULT_ELEMENTS[key];
        }
    }

    onClickPreview() {
        window.open(`${BASE_URL}/preview/${this.pool._id}`, '_blank');
    }

    async onClickUpdate() {
        if (!this.widget) return;

        this.isSubmitting = true;
        await this.$store.dispatch('widgets/update', {
            poolId: this.pool._id,
            message: this.message,
            domain: this.domain,
            align: this.align,
            uuid: this.widget.uuid,
            color: this.color,
            bgColor: this.bgColor,
            theme: JSON.stringify({ elements: this.elements, colors: this.colors }),
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
#widget-iframe-preview {
    display: block;

    .widget-iframe {
        font-size: 14px;
        max-width: 400px;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
    }

    .btn {
        border: 0;
    }

    .navbar-bottom {
        padding: 0.5rem;
        border-top: 1px solid var(--txh-navbar-bottom-border-color);
        background-color: var(--thx-navbar-bg);

        a {
            margin: 0;
            line-height: 1;
            width: 70px;
            height: 70px;
            align-items: center;
            justify-content: center;
            display: flex;
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
        }

        .btn-link {
            color: white;
            opacity: 0.65;
        }
    }
}
.widget-message {
    margin-top: 2rem;
    display: flex;
    line-height: 1.5;
    font-size: 13px;
    justify-content: center;
    align-items: center;
    width: 200px;
    color: rgb(0, 0, 0);
    position: relative;
    background-color: rgb(255, 255, 255);
    border-radius: 5px;
    user-select: none;
    padding: 15px 10px 10px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
    opacity: 1;
    transform: scale(1);
    transition: opacity 0.2s ease 0s, transform 0.1s ease 0s;

    .widget-message-logo {
        z-index: 0;
        display: block;
        background-color: rgb(255, 255, 255);
        width: 40px;
        height: 40px;
        top: -20px;
        position: absolute;
        border-radius: 50%;
        background-size: 40px;
        background-position: center center;
        background-repeat: no-repeat;
    }

    .widget-message-close {
        display: flex;
        font-family: Arial;
        font-size: 16px;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border: 0px;
        color: rgb(0, 0, 0);
        position: absolute;
        background-color: transparent;
        top: 0px;
        right: 0px;
        opacity: 0.5;
        transform: scale(0.9);
        transition: opacity 0.2s ease 0s, transform 0.1s ease 0s;
    }
}
</style>
