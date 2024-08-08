<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            @click="isVisible = !isVisible"
        >
            <strong>Info Links</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <slot></slot>

                <b-form-group :key="key" v-for="(link, key) of infoLinks">
                    <b-row>
                        <b-col md="3">
                            <b-input-group>
                                <b-form-input
                                    placeholder="Label"
                                    :value="infoLinks[key].label"
                                    @change="onChangeLink({ key, label: $event })"
                                />
                            </b-input-group>
                        </b-col>
                        <b-col md="9">
                            <b-input-group>
                                <b-form-input
                                    placeholder="https://example.com"
                                    :value="infoLinks[key].url"
                                    @change="onChangeLink({ key, url: $event })"
                                />
                                <b-input-group-append>
                                    <b-button variant="gray" @click="onClickRemoveLink(key)">
                                        <i class="fas fa-times ml-0"></i>
                                    </b-button>
                                </b-input-group-append>
                            </b-input-group>
                        </b-col>
                    </b-row>
                </b-form-group>
                <b-form-group class="text-center">
                    <b-link @click="onClickAddLink">Add another info link</b-link>
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';

@Component({})
export default class BaseCardInfoLinks extends Vue {
    isVisible = false;
    isValidUrl = isValidUrl;

    @Prop() pool!: TPool;
    @Prop({ default: () => [{ key: 0, label: '', url: '' }] }) infoLinks!: TInfoLink[];

    mounted() {
        this.isVisible = !!this.infoLinks.length;
    }

    onChangeLink({ key, label, url }: { key: number; label?: string; url?: string }) {
        const infoLinks = Object.assign(this.infoLinks);
        infoLinks[key] = {
            label: label ? label : this.infoLinks[key].label,
            url: url ? url : this.infoLinks[key].url,
        };
        this.$emit('change', infoLinks);
    }

    onClickRemoveLink(key) {
        const infoLinks = Object.assign(this.infoLinks);
        infoLinks.splice(key, 1);
        this.$emit('change', infoLinks);
    }
    onClickAddLink() {
        const infoLinks = Object.assign(this.infoLinks);
        infoLinks[infoLinks.length] = { label: '', url: '' };
        this.$emit('change', infoLinks);
    }
}
</script>
