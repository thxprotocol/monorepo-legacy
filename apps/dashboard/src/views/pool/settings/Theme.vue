<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Brand</strong>
                <p class="text-muted">
                    White label your campaign pages for a fully integrated user experience in your website.
                </p>
            </b-col>
            <b-col md="8">
                <b-media>
                    <template #aside v-if="logoImgUrl">
                        <b-card body-class="p-2" footer-class="p-2">
                            <b-img
                                width="100%"
                                height="auto"
                                class="m-0"
                                alt="Signin page logo image"
                                :src="logoImgUrl"
                            />
                            <template #footer>
                                <b-link @click="onClickRemoveLogo" class="text-danger">Remove</b-link>
                            </template>
                        </b-card>
                    </template>
                    <b-form-group label="Logo" description="Only .jpg, .jpeg and .png files are allowed">
                        <b-form-file @change="onUpload($event, 'logoImgUrl')" accept=".jpg, .jpeg, .png" />
                    </b-form-group>
                </b-media>
                <hr />
                <b-media>
                    <template #aside v-if="backgroundImgUrl">
                        <b-card body-class="p-2" footer-class="p-2">
                            <b-img
                                width="100%"
                                height="auto"
                                class="m-0"
                                alt="Signin page background image"
                                :src="backgroundImgUrl"
                            />
                            <template #footer>
                                <b-link @click="onClickRemoveBackground" class="text-danger">Remove</b-link>
                            </template>
                        </b-card>
                    </template>
                    <b-form-group label="Background" description="Only .jpg, .jpeg and .png files are allowed">
                        <b-form-file @change="onUpload($event, 'backgroundImgUrl')" accept=".jpg, .jpeg, .png" />
                    </b-form-group>
                </b-media>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Color scheme</strong>
                <p class="text-muted">
                    Customize the colors of your campaign
                    <b-link target="_blank" :href="`/preview/${pool._id}`">
                        widget
                        <i class="fas fa-external-link-alt" />
                    </b-link>
                    and
                    <b-link target="_blank" :href="`${widgetUrl}/c/${pool._id}`">
                        landing page
                        <i class="fas fa-external-link-alt" /> </b-link
                    >.
                </p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="6">
                        <b-form-row>
                            <b-col md="6">
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
                            <b-col md="6">
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
                        </b-form-row>
                        <BButton
                            block
                            :disabled="!widget || isSubmitting"
                            variant="primary"
                            class="rounded-pill"
                            @click="onClickUpdate"
                        >
                            <b-spinner v-if="isSubmitting" small variant="white" class="mr-2" />
                            Publish
                        </BButton>
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
                                    <div class="pl-3 py-2 text-center text-decoration-none">
                                        <strong :style="`color: ${colors.accent.color};`" class="h3 m-0">250</strong>
                                        <div>points</div>
                                    </div>
                                    <div
                                        class="card"
                                        :style="`background-color: ${elements.cardBg.color}; color: ${elements.cardText.color};`"
                                    >
                                        <div class="card-header">
                                            <div class="card-title mb-0 d-flex justify-content-between">
                                                Daily Reward
                                                <strong class="ml-auto" :style="`color: ${colors.accent.color}`">
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
                                            <blockquote
                                                :style="`border-color: ${elements.btnBg.color}; background-color: ${elements.bodyBg.color}; color:  ${elements.text.color}`"
                                            >
                                                Retweet a tweet
                                            </blockquote>
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
                                        :style="`background-color: ${elements.navbarBtnBg.color}; color: ${elements.navbarBtnText.color};`"
                                    >
                                        <i class="fas fa-trophy m-0" style="font-size: 1.3rem"></i>Earn
                                    </b-button>
                                    <b-button variant="link" class="text-center">
                                        <i class="fas fa-store m-0" style="font-size: 1.3rem"></i>Shop
                                    </b-button>
                                    <b-button variant="link" class="text-center">
                                        <i class="fas fa-wallet m-0" style="font-size: 1.3rem"></i>Wallet
                                    </b-button>
                                </div>
                            </div>
                            <div
                                class="widget-launcher ml-auto mt-3"
                                :style="`background-color: ${elements.launcherBg.color}`"
                            >
                                <div class="widget-notifications">3</div>
                                <b-img
                                    style=""
                                    width="40"
                                    height="40"
                                    :src="iconImg"
                                    v-if="iconImg"
                                    id="thx-svg-icon"
                                />
                                <svg
                                    v-else
                                    id="thx-svg-icon"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    :style="`fill: ${elements.launcherIcon.color}; width: 20px; height: 20px;`"
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
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IWidgets } from '@thxnetwork/dashboard/store/modules/widgets';
import BaseWidgetAlertPreview from '@thxnetwork/dashboard/components/widget/BaseWidgetAlertPreview.vue';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';
import Color from 'color';
import { WIDGET_URL, AUTH_URL, BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { DEFAULT_ELEMENTS, DEFAULT_COLORS } from '@thxnetwork/types/contants';
import { TBrand } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';

@Component({
    components: {
        BaseWidgetAlertPreview,
        BaseCodeExample,
    },
    computed: mapGetters({
        brands: 'brands/all',
        pools: 'pools/all',
        widgets: 'widgets/all',
    }),
})
export default class WidgetsView extends Vue {
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    widgets!: IWidgets;
    widgetUrl = WIDGET_URL;
    authUrl = AUTH_URL;
    Color = Color;
    loading = false;
    isSubmitting = false;
    iconImg = ' ';
    backgroundImgUrl = '';
    logoImgUrl = '';
    elements = Object.assign({}, DEFAULT_ELEMENTS); // Clean object for reset behavior
    colors = Object.assign({}, DEFAULT_COLORS); // Clean object for reset behavior

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get widget() {
        if (!this.widgets[this.$route.params.id]) return;
        return Object.values(this.widgets[this.$route.params.id])[0];
    }

    get brand() {
        return this.brands[this.$route.params.id];
    }

    get isBrandUpdateInvalid() {
        const backgroundUrlIsValid = this.backgroundImgUrl
            ? isValidUrl(this.backgroundImgUrl)
            : this.backgroundImgUrl === '';
        const logoUrlIsValid = this.logoImgUrl ? isValidUrl(this.logoImgUrl) : this.logoImgUrl === '';
        return logoUrlIsValid && backgroundUrlIsValid;
    }

    mounted() {
        this.$store.dispatch('widgets/list', this.pool).then(async () => {
            if (!this.widget) return;

            this.iconImg = this.widget.iconImg;

            const { elements, colors } = JSON.parse(this.widget.theme);
            for (const key in this.elements) {
                this.elements[key] = elements[key] ? elements[key] : this.elements[key];
            }
            for (const key in this.colors) {
                this.colors[key] = colors[key] ? colors[key] : this.colors[key];
            }
        });

        this.$store.dispatch('brands/getForPool', this.pool._id).then(async () => {
            if (!this.brand) return;
            this.backgroundImgUrl = this.brand.backgroundImgUrl;
            this.logoImgUrl = this.brand.logoImgUrl;
        });
    }

    async upload(file: File) {
        return await this.$store.dispatch('images/upload', file);
    }

    async onUpload(event: any, key: string) {
        const publicUrl = await this.upload(event.target.files[0]);
        Vue.set(this, key, publicUrl);
        await this.updateBrand();
    }

    async onClickRemoveBackground() {
        this.backgroundImgUrl = '';
        await this.updateBrand();
    }

    async onClickRemoveLogo() {
        this.logoImgUrl = '';
        await this.updateBrand();
    }

    async updateBrand() {
        this.loading = true;
        await this.$store.dispatch('brands/update', {
            pool: this.pool,
            brand: { backgroundImgUrl: this.backgroundImgUrl, logoImgUrl: this.logoImgUrl },
        });
        this.loading = false;
    }

    onClickResetColors() {
        for (const key in DEFAULT_COLORS) {
            Object.assign(this.colors[key], DEFAULT_COLORS[key]);
        }
    }

    onClickResetElements() {
        for (const key in DEFAULT_ELEMENTS) {
            Object.assign(this.elements[key], DEFAULT_ELEMENTS[key]);
        }
    }

    onClickPreview() {
        window.open(`${BASE_URL}/preview/${this.pool._id}`, '_blank');
    }

    async onClickUpdate() {
        if (!this.widget) return;
        this.isSubmitting = true;
        await this.$store.dispatch('widgets/update', {
            uuid: this.widget.uuid,
            poolId: this.pool._id,
            theme: JSON.stringify({ elements: this.elements, colors: this.colors }),
        });
        this.isSubmitting = false;
    }
}
</script>
<style lang="scss">
#thx-svg-icon {
    display: block;
    margin: auto;
    fill: white;
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
    z-index: 1;
    display: flex;
    font-family: Helvetica, Arial, sans-serif;
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

    blockquote {
        border-left: 3px solid #5942c1;
        background-color: #3d2d88;
        padding: 0.5rem;

        a {
            transition: color 0.2s ease;

            &:hover {
                color: #ffffff !important;
            }
        }
    }

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

        button {
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
            flex-direction: column;

            i {
                margin-bottom: 0.25rem !important;
            }
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
    padding: 5px 10px 5px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
    opacity: 1;
    transform: scale(1);
    transition: opacity 0.2s ease 0s, transform 0.1s ease 0s;

    .widget-message-close {
        display: flex;
        font-family: Helvetica, Arial, sans-serif;
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
