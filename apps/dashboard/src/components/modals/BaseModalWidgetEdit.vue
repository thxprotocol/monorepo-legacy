<template>
    <b-modal
        size="lg"
        title="Edit Widget"
        :id="`modalWidgetEdit-${widget.clientId}`"
        no-close-on-backdrop
        no-close-on-esc
        centered
        :hide-footer="loading"
    >
        <template v-slot:modal-header v-if="loading">
            <div
                class="w-auto center-center bg-secondary mx-n5 mt-n5 pt-5 pb-5 flex-grow-1 flex-column position-relative"
                :style="`
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-image: url(${require('../../../public/assets/thx_modal-header.webp')});
                `"
            >
                <h2 class="d-block">Uno momento!</h2>
                <div
                    class="shadow-sm bg-white p-2 rounded-pill d-flex align-items-center justify-content-center"
                    style="position: absolute; bottom: 0; left: 50%; margin-left: -32px; margin-bottom: -32px"
                >
                    <b-spinner size="lg" style="width: 3rem; height: 3rem" variant="primary"></b-spinner>
                </div>
            </div>
        </template>
        <div class="pt-5 pb-3" v-if="loading">
            <p class="text-center">
                <strong>We are assembling your widget</strong><br /><span class="text-muted">
                    This should be done real soon.
                </span>
            </p>
        </div>
        <form v-else v-on:submit.prevent="submit" id="formWidgetEdit">
            <div class="row">
                <div class="col-md-6">
                    <b-alert variant="danger" show v-if="error">
                        {{ error }}
                    </b-alert>

                    <b-form-group>
                        <label>Reward</label>
                        <b-form-input readonly v-model="widgetReward" />
                    </b-form-group>

                    <b-form-group>
                        <label>Page URL</label>
                        <b-form-input readonly v-model="widget.requestUri" placeholder="http://localhost:8080" />
                    </b-form-group>

                    <strong class="d-block mt-5 mb-3">Styling</strong>
                    <div class="row">
                        <div class="col-md-6">
                            <b-form-group>
                                <label>Button Color</label>
                                <b-form-select v-model="widgetColor">
                                    <b-form-select-option
                                        :key="color.name"
                                        v-for="color of widgetColors"
                                        :value="color"
                                        :style="`color: ${color.hex}`"
                                    >
                                        {{ color.name }}
                                    </b-form-select-option>
                                </b-form-select>
                            </b-form-group>
                        </div>
                        <div class="col-md-6">
                            <b-form-group>
                                <label>Emoji</label>
                                <b-form-select v-model="widgetEmoji">
                                    <b-form-select-option
                                        :key="emoji.unicode"
                                        v-for="emoji of widgetEmojis"
                                        :value="emoji"
                                    >
                                        <div class="d-block rounded-pill">{{ emoji.unicode }} {{ emoji.name }}</div>
                                    </b-form-select-option>
                                </b-form-select>
                            </b-form-group>
                        </div>
                        <div class="col-md-6">
                            <b-form-group>
                                <label>Button Text</label>
                                <b-form-input v-model="widgetButtonText" />
                            </b-form-group>
                        </div>
                        <div class="col-md-6">
                            <b-form-group>
                                <label>Button Shape</label>
                                <b-form-select v-model="widgetShape">
                                    <b-form-select-option
                                        :key="shape.name"
                                        v-for="shape of widgetShapes"
                                        :value="shape"
                                    >
                                        <div :class="shape.class">{{ shape.class }} {{ shape.name }}</div>
                                    </b-form-select-option>
                                </b-form-select>
                            </b-form-group>
                        </div>
                    </div>
                </div>
                <div class="col-md-6" v-if="widget.reward">
                    <b-card bg-variant="light" class="border-0" body-class="p-3">
                        <strong class="mb-3 d-block">Preview</strong>
                        <div class="mb-3">
                            <iframe
                                frameBorder="0"
                                :width="widget.metadata.width"
                                :height="widget.metadata.height"
                                :src="`${widgetUrl}/?asset_pool=${pool.address}&client_id=${widget.clientId}&client_secret=${widget.clientSecret}&reward_id=${widget.reward.id}&reward_amount=${widget.reward.withdrawAmount}&reward_symbol=${pool.erc20.symbol}`"
                            >
                            </iframe>
                        </div>
                        <strong>HTML Embed</strong>
                        <p class="small">
                            Paste the embed code somewhere in your HTML page and make sure to use the correct Page URL
                            so you don't run into those nasty CORS issues.
                        </p>
                        <div class="input-group">
                            <div
                                class="form-control"
                                readonly
                                style="font-size: 0.8rem; font-family: Courier; height: 200px; overflow: auto"
                            >
                                {{ widgetEmbedCode }}
                            </div>
                            <div class="input-group-append">
                                <button class="btn btn-primary" type="button" v-clipboard:copy="pool.address">
                                    <i class="far fa-copy m-0" style="font-size: 1.2rem"></i>
                                </button>
                            </div>
                        </div>
                        <pre class="p-2 m-0"></pre>
                    </b-card>
                </div>
            </div>
        </form>
        <template v-slot:modal-footer="{}">
            <b-button disabled class="rounded-pill" type="submit" variant="primary" form="formWidgetCreate" block>
                Update Widget
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import type { Reward } from '@thxnetwork/dashboard/types/rewards';
import { Widget } from '@thxnetwork/dashboard/store/modules/widgets';

interface WidgetColor {
    hex: string;
    name: string;
}
interface WidgetEmoji {
    unicode: string;
    name: string;
}
interface WidgetShape {
    class: string;
    name: string;
}

@Component({
    computed: mapGetters({
        clients: 'clients/all',
    }),
})
export default class ModalWidgetEdit extends Vue {
    widgetUrl = process.env.VUE_APP_WIDGET_URL;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    loading = false;
    error = '';

    widgetRequestUri = '';
    widgetButtonText = '';
    widgetColor: WidgetColor | null = null;
    widgetEmoji: WidgetEmoji | null = null;
    widgetShape: WidgetShape | null = null;
    widgetColors: WidgetColor[] = [
        {
            hex: 'purple',
            name: 'Purple',
        },
    ];
    widgetEmojis: WidgetEmoji[] = [
        {
            unicode: '🎁',
            name: 'Giftbox',
        },
    ];
    widgetShapes: WidgetShape[] = [
        {
            class: '',
            name: 'Rounded Pill',
        },
    ];

    @Prop() pool!: IPool;
    @Prop() filteredRewards!: Reward[];
    @Prop() widget!: Widget;

    mounted() {
        this.widgetButtonText = 'Claim';
        this.widgetColor = this.widgetColors[0];
        this.widgetEmoji = this.widgetEmojis[0];
        this.widgetShape = this.widgetShapes[0];
    }

    get widgetReward() {
        if (!this.widget.reward) {
            return '';
        }
        return `#${this.widget.reward.id} (${this.widget.reward.withdrawAmount} ${this.pool.erc20.symbol})`;
    }

    get widgetEmbedCode() {
        if (!this.widget.reward) {
            return '';
        }
        return `<iframe width="${this.widget.metadata.width}" height="${this.widget.metadata.height}"
                                frameBorder="0" src="${this.widgetUrl}/?asset_pool=${this.pool.address}&client_id=${this.widget.clientId}&client_secret=${this.widget.clientSecret}&reward_id=${this.widget.metadata.rewardUuid}&reward_amount=${this.widget.reward.withdrawAmount}&reward_symbol=${this.pool.erc20.symbol}"></iframe>`;
    }

    async submit() {
        this.loading = true;
        try {
            await this.$store.dispatch('widgets/update', {
                metadata: {
                    // emoji
                    // shape
                    // buttonText
                    // buttonColor
                },
            });
            this.$bvModal.hide(`modalWidgetEdit-${this.widget.clientId}`);
        } catch (e) {
            this.error = 'Could not add the reward.';
        } finally {
            this.loading = false;
        }
    }
}
</script>
<style lang="scss"></style>
