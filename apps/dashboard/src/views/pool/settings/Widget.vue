<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Visibility</strong>
                <p class="text-muted">Toggle the visibility of your campaign widget.</p>
            </b-col>
            <b-col md="8">
                <b-form-group>
                    <b-form-checkbox @change="onChangePublished" v-model="isPublished" class="mr-3">
                        <strong>Visible</strong><br />
                        <span class="text-muted">
                            Allows you to show/hide the campaign launcher after embedding the
                            <b-link :to="`/pool/${pool._id}/developer`">campaign widget script</b-link>.
                        </span>
                    </b-form-checkbox>
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />

        <b-form-row>
            <b-col md="4">
                <strong>Launcher</strong>
                <p class="text-muted">
                    The launcher is used to toggle the visibility of your widget. Bring your own or adjust our default
                    launch button and message.
                </p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="6">
                        <b-form-group description="Dimensions: 40px x 40px. File types: .jpg, .png, .svg">
                            <template #label>
                                Icon
                                <b-link v-if="iconImg" @click="onClickRemoveIcon" class="text-danger float-right">
                                    Remove
                                </b-link>
                            </template>
                            <b-input-group>
                                <b-input-group-prepend variant="light" v-if="iconImg">
                                    <b-card
                                        bg-variant="light"
                                        body-class="p-0 d-flex align-items-center px-1"
                                        style="border-top-right-radius: 0; border-bottom-right-radius: 0"
                                    >
                                        <b-img
                                            width="40"
                                            height="40"
                                            :src="iconImg"
                                            class="rounded"
                                            id="thx-svg-icon"
                                        />
                                    </b-card>
                                </b-input-group-prepend>
                                <b-form-file @change="onUploadIcon($event)" accept="image/*" />
                            </b-input-group>
                        </b-form-group>
                        <b-form-group :description="`${message ? message.length : 0}/280`" label="Message">
                            <b-textarea
                                @change="onChangeMessage"
                                v-model="message"
                                placeholder="Hi there! Click me to complete quests and earn rewards..."
                            >
                            </b-textarea>
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
                                <span style="z-index: 0">{{ message }}</span>
                                <button class="widget-message-close">×</button>
                            </div>
                            <div class="widget-launcher mt-3" :style="`background-color: ${elements.launcherBg.color}`">
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
                <hr />
                <b-form-group
                    label="CSS Selector"
                    description="This CSS selector will set an element in your HTML as the widget launch button and hide the default launcher."
                >
                    <b-form-input v-model="cssSelector" @change="onChangeCSSSelector" />
                </b-form-group>
                <hr />
                <b-form-group
                    label="Alignment"
                    description="Used for the positioning of both the default launcher and widget."
                >
                    <b-form-row>
                        <b-col>
                            <b-form-radio
                                v-model="align"
                                name="align"
                                @change="onChangeAlign"
                                value="left"
                                class="mb-0"
                            >
                                Left
                            </b-form-radio>
                        </b-col>
                        <b-col>
                            <b-form-radio
                                v-model="align"
                                name="align"
                                @change="onChangeAlign"
                                value="center"
                                class="mb-0"
                            >
                                Center
                            </b-form-radio>
                        </b-col>
                        <b-col>
                            <b-form-radio
                                v-model="align"
                                name="align"
                                @change="onChangeAlign"
                                value="right"
                                class="mb-0"
                            >
                                Right
                            </b-form-radio>
                        </b-col>
                    </b-form-row>
                </b-form-group>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import Color from 'color';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IWidgets } from '@thxnetwork/dashboard/store/modules/widgets';
import BaseWidgetAlertPreview from '@thxnetwork/dashboard/components/widget/BaseWidgetAlertPreview.vue';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';
import { DEFAULT_ELEMENTS } from '@thxnetwork/types/contants';

@Component({
    components: {
        BaseWidgetAlertPreview,
        BaseCodeExample,
    },
    computed: mapGetters({
        pools: 'pools/all',
        widgets: 'widgets/all',
    }),
})
export default class WidgetsView extends Vue {
    pools!: IPools;
    widgets!: IWidgets;

    Color = Color;
    message = '';
    align = 'left';
    iconImg = '';
    cssSelector = '';
    isPublished = true;

    isSubmitting = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get widget() {
        if (!this.widgets[this.$route.params.id]) return;
        return Object.values(this.widgets[this.$route.params.id])[0];
    }

    get elements() {
        if (!this.widget) return DEFAULT_ELEMENTS;
        const { elements } = JSON.parse(this.widget.theme);
        return elements;
    }

    mounted() {
        this.$store.dispatch('widgets/list', this.pool).then(async () => {
            if (!this.widget) return;

            this.align = this.widget.align;
            this.message = this.widget.message;
            this.iconImg = this.widget.iconImg;
            this.cssSelector = this.widget.cssSelector;
            this.isPublished = this.widget.isPublished;
        });
    }

    onChangeCSSSelector(value: string) {
        this.cssSelector = value;
        this.onClickUpdate();
    }

    onChangePublished(value: boolean) {
        this.isPublished = value;
        this.onClickUpdate();
    }

    onChangeMessage(value: string) {
        this.message = value;
        this.onClickUpdate();
    }

    onChangeAlign(value: string) {
        this.align = value;
        this.onClickUpdate();
    }

    async onUploadIcon(event: any) {
        this.isSubmitting = true;
        const iconImg = await this.$store.dispatch('images/upload', event.target.files[0]);
        this.iconImg = iconImg;
        this.onClickUpdate();
    }

    onClickRemoveIcon() {
        this.iconImg = '';
        this.onClickUpdate();
    }

    async onClickUpdate() {
        if (!this.widget) return;
        this.isSubmitting = true;
        await this.$store.dispatch('widgets/update', {
            uuid: this.widget.uuid,
            isPublished: this.isPublished,
            iconImg: this.iconImg,
            poolId: this.pool._id,
            message: this.message,
            align: this.align,
            cssSelector: this.cssSelector,
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
